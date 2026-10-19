# Extracting existing H5P uploads

The backend batch command selects up to two H5P upload records that have no matching
`h5p_extraction` entry, using `ORDER BY random() LIMIT 2`. It downloads each archive
from its recorded bucket and key, extracts it locally, and uploads the files to the
destination bucket. Files retain their package paths and receive content types for
browser playback.

Run the backend database migrations before using the command. The `h5p_extraction`
table is created by `20261016000000_create_h5p_extraction.js`; the backend normally
applies migrations on startup.

Use the backend's normal environment variables for database and S3 configuration.
Build and run from `aoe-web-backend`:

```sh
npm run build
npm run extract-h5p -- aoe-uploaded-materials-qa
```

In a built backend container, run the entry point directly:

```sh
node --enable-source-maps dist/tasks/extractH5pUploads.js aoe-uploaded-materials-qa
```

Pass the destination bucket for the intended environment explicitly. For local
development, the destination bucket is `aoe-uploaded-materials`.

Each invocation processes one batch and reports selected, processed and failed counts.
Run one instance at a time and invoke it again to process more files. A failed file
does not stop the other files in the batch. The exit code is nonzero if any file fails
or the batch cannot start.

The command inserts a completion row only after every extracted file has uploaded.
Failed files remain eligible for subsequent random selections. Retries reuse the same
`files/<record-id>/<source-hash>/` prefix; the source hash includes the bucket and key,
so replacing an upload's key produces a separate extraction. Temporary files are
removed after each attempt. A package must contain a root `h5p.json` file. Extraction
and playback validation are separate: the command preserves the package's contents
without requiring all H5P playback libraries to be present.

Extraction is limited to 5 GiB of decompressed data and 100,000 ZIP entries per archive.
Both declared sizes and bytes actually streamed are checked. Override these limits
with positive integer environment variables `H5P_MAX_EXTRACTED_BYTES` and
`H5P_MAX_EXTRACTED_ENTRIES` when larger packages are expected. An archive exceeding a
limit fails without a completion row and can be retried with a larger budget.
