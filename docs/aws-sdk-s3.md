# AWS SDK v3 (S3) — always free the socket

`GetObjectCommand.Body` is a stream (v2 buffered it) and the pool defaults to `maxSockets: 50`.
An unconsumed `Body` holds its socket; 50 leaks wedge the pool (`socket usage at capacity=50 ... enqueued`).
Unlike v2, destroying the stream is not enough on its own and a client disconnect does not cancel the request — cancellation is decoupled from the stream.
Reference: `downloadFromStorage()` in `aoe-web-backend/src/query/fileHandling.ts` (AOE-115).

- Always fully consume or destroy the `Body` so its socket is released, even on error or early exit.
- Wire the client disconnect to cancel the S3 request itself, not just tear down the stream — this also releases requests still queued waiting for a socket.
- Treat a client-cancel error as benign, not a server error (no 500, no alarm).

