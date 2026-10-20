# Extracting H5P uploads

`config.featureFlags.extractH5PFilesToS3` controls upload extraction, backfill
scheduling and the manual batch command. It is enabled only in dev and QA
(`ENV=dev` or `ENV=qa`), and disabled in production and other environments.

When enabled, both material upload endpoints extract new H5P packages after the
original archive is stored and the transaction saving its file key has committed.
Other file types are not extracted. Processing continues
after the upload response, independently of client disconnects. Extraction failures
are logged without marking the material obsolete or failing the upload. They leave
no completion entry, so the backfill job can retry them. Upload extraction runs
independently of the additional setting that enables scheduled backfill.

The backend batch command selects up to two H5P upload records that have no matching
`h5p_extraction` entry, using `ORDER BY random() LIMIT 2`. It downloads each archive
using its recorded key from `CLOUD_STORAGE_BUCKET`, the environment's upload bucket,
extracts it locally, and uploads the files to the destination bucket. This matches
normal H5P playback and downloads; historical `record.filebucket` values are ignored.
Files retain their package paths and receive content types for browser playback.

The shared `extractH5pUpload` service processes one upload identified by its record ID
and file key. It extracts and uploads the package, records completion in
`h5p_extraction`, and returns the S3 object prefix. Errors propagate to the caller.
The batch command uses this operation for each selected upload and continues after
individual failures.

With the feature flag enabled, browser playback uses completed extractions from S3.
Draft, published and version-specific material metadata matches `h5p_extraction`
against the record ID and current file key. It returns the public
`HTML_BASE_URL/files/<record-id>/<source-hash>` directory as the preview URL with
the `application/h5p` MIME type. The URL omits the trailing slash because the client
player appends package file paths with a slash. Completed packages do not need to be
downloaded or extracted by the backend during metadata requests. Packages without a
matching completion entry keep the existing preview fallback. If a package cannot
play, the frontend offers the original file for download.

When the feature flag is enabled, the existing backend scheduler runs one batch
every five minutes (`0 */5 * * * *`), using the shared S3 client. No timezone override
is needed for this interval. `SCHEDULED_TASK_H5P_EXTRACTION_ENABLED=false` additionally
disables scheduled backfill without disabling upload extraction; this task setting
defaults to enabled. The destination is configured with
`CLOUD_STORAGE_BUCKET_UPLOADED_MATERIALS`: `aoe-uploaded-materials-dev`,
`aoe-uploaded-materials-qa` or `aoe-uploaded-materials-prod`, and
`aoe-uploaded-materials` locally.

At the start of each batch, the service logs progress in the message, for example
`H5P extraction batch starting: 120 of 500 uploads processed`, and includes
`extracted` and `total` as structured fields. Both counts include only H5P records
with a file key; `extracted` counts records with a completion entry matching their
current file key. This progress is logged even when no files remain to extract.

Each batch obtains one PostgreSQL session advisory lock on a dedicated connection
through the shared `runTaskWithLock` function used by all scheduled jobs.
The lock covers selection, extraction, upload, completion writes and temporary-file
cleanup. Other servers skip while the lock is held. Manual invocations use the same
lock. The connection is closed in `finally`, releasing the lock on success or failure.
If the connection is lost, active transfers are aborted and the batch stops;
PostgreSQL also releases the disconnected session's lock.

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

Pass the destination bucket for the intended dev or QA environment explicitly.
The manual command skips without creating database or S3 clients when the feature
flag is disabled.

Each manual invocation processes one batch and reports selected, processed and failed
counts. It logs a skip and exits successfully when another worker holds the lock.
Invoke it again to process more files. A failed file does not stop the other files in
the batch. The exit code is nonzero if any file fails or the batch cannot start.

The command inserts a completion row only after every extracted file has uploaded.
Failed files remain eligible for subsequent random selections. Retries reuse the same
`files/<record-id>/<source-hash>/` prefix; the source hash includes the bucket and key,
so replacing an upload's key produces a separate extraction. Temporary files are
removed after each attempt. A package must contain a root `h5p.json` file. Extraction
and playback validation are separate: the command preserves the package's contents
without requiring all H5P playback libraries to be present.

Each extracted file is streamed directly to S3 with `PutObject`. The
uploaded-materials bucket also has a lifecycle rule that makes incomplete multipart
uploads eligible for automatic cleanup one day after initiation.

Extraction has fixed limits of 5 GiB of decompressed data and 100,000 ZIP entries per
archive. Both declared sizes and bytes actually streamed are checked. An archive
exceeding either limit fails without a completion row.
