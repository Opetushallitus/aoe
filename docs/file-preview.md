# File previews

H5P packages and ZIP uploads (`application/zip`, `application/x-zip-compressed`) are
extracted to the uploaded-materials bucket and previewed from there through CloudFront
`/files/*`. Office files get a PDF preview from the office→PDF conversion. The preview
kind of a record is stored in `record.preview_type`: `h5p`, `html-zip`, `office` or NULL.
A `.h5p` file name takes precedence over the ZIP MIME type.

## Upload

Both material upload endpoints extract the preview after the original archive is
stored and the transaction saving its file key has committed.

- **H5P, v2 endpoint** (`POST /api/v2/material/file/:id/upload`): responds only after
  extraction succeeds. A package that is not a valid ZIP, exceeds the size limits or has
  no root `h5p.json` is rejected with 400; other failures return 500. Either way the
  material is marked obsolete.
- **ZIP, v2 endpoint, and both kinds on v1:** extraction failures are only logged. The
  backfill retries ZIPs only; a failed v1 H5P stays download-only.

Replacing a record's file sets `preview_type` back to NULL until the new file has a preview.

## Extraction

`extractFilePreview` in `src/services/filePreviewService.ts` processes one upload
identified by its record ID and file key. It reads the archive from
`CLOUD_STORAGE_BUCKET` (historical `record.filebucket` values are ignored) with zip.js over
ranged GETs, without local disk, and streams every entry straight to
`CLOUD_STORAGE_BUCKET_UPLOADED_MATERIALS`
under `files/<record-id>/<sha256([sourceBucket, filekey])>/`, with content types for
browser playback.

- **H5P** needs a root `h5p.json`.
- **ZIP** needs an `index.html`, or else an `index.htm`, outside `__MACOSX`. The first one
  in ZIP entry order is used and stored as `file_preview.entry_path` relative to the
  prefix. A ZIP without an entry, or one that is not a valid ZIP or exceeds the limits,
  is recorded as successful with no prefix: it is download-only and isn't retried.

Limits: 5 GiB of decompressed data and 100,000 entries per archive, checked against the
declared sizes. An entry that streams more bytes than it declares fails the extraction.
Zip-slip paths are rejected by zip.js.

On success, one transaction upserts the `file_preview` row (`success = true`, prefix,
entry path, `processed_at`) and sets `record.preview_type`. A failure stores
`success = false` with no prefix, cannot overwrite a successful row, and propagates.
Retries reuse the same prefix; a new file key gives a new prefix. The bucket's lifecycle rule cleans up incomplete multipart
uploads after one day.

## Backfill

The `filePreviewBackfill` scheduled job (every 5 minutes,
`SCHEDULED_TASK_FILE_PREVIEW_BACKFILL_ENABLED`) runs under `runTaskWithLock` like the
other jobs. Each run:

1. Sets `preview_type` on records that have a preview but no type (rows written by old
   tasks during a rolling deploy, and office PDFs).
2. Logs `File preview batch starting: <n> uploads remaining, <m> of them failed before`.
3. Extracts up to five random ZIP records (not `.h5p`) with no successful `file_preview`
   row for their current file key, continuing after individual failures. H5P packages
   were already backfilled by the earlier H5P extraction job.

## Playback

Draft, published and version-specific material metadata (`apiQueries.ts`) joins
`file_preview` on record ID and current file key with `success`:

- **H5P:** `application/h5p` and `HTML_BASE_URL/files/<record-id>/<hash>` without a
  trailing slash (the player appends paths with a slash). `/h5p/play/<file-key>` plays it
  with h5p-standalone, or returns 404. Without a successful extraction the package is
  download-only.
- **ZIP:** `text/html` and `HTML_BASE_URL/files/<record-id>/<hash>/<entry_path>`. A ZIP
  with no row yet still uses the old EFS extraction under `/content/` and logs a warning;
  that fallback is removed once the backfill has processed every ZIP.

## Schema

`file_preview` (renamed from `h5p_extraction` in `20261105120000_add_file_preview.js`)
keeps one row per record and source file key, not attempt history. During the rolling
deploy a `h5p_extraction` view lets old tasks keep writing; it is dropped later.

Files whose extraction is currently failing:

```sql
SELECT f.record_id, r.originalfilename, f.source_file_key, f.processed_at
FROM file_preview f
JOIN record r ON r.id = f.record_id
WHERE f.success = false
ORDER BY f.processed_at DESC;
```
