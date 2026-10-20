# Extracting existing H5P uploads

The backend batch command selects up to two H5P upload records that have no matching
`h5p_extraction` entry, using `ORDER BY random() LIMIT 2`. It downloads each archive
from its recorded bucket and key, extracts it locally, and uploads the files to the
destination bucket. Files retain their package paths and receive content types for
browser playback.

The shared `extractH5pUpload` service processes one upload identified by its record ID
and file key. It extracts and uploads the package, records completion in
`h5p_extraction`, and returns the S3 object prefix. Errors propagate to the caller.
The batch command uses this operation for each selected upload and continues after
individual failures.

The existing backend scheduler runs one batch every ten minutes (`0 */10 * * * *`),
using the shared S3 client. No timezone override is needed for this interval.
`SCHEDULED_TASK_H5P_EXTRACTION_ENABLED=false` disables automatic execution; it is
enabled by default. The destination is configured with
`CLOUD_STORAGE_BUCKET_UPLOADED_MATERIALS`: `aoe-uploaded-materials-dev`,
`aoe-uploaded-materials-qa` or `aoe-uploaded-materials-prod`, and
`aoe-uploaded-materials` locally.

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

Pass the destination bucket for the intended environment explicitly. For local
development, the destination bucket is `aoe-uploaded-materials`.

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
