// 5 GB (decimal) — must match backend FILE_SIZE_LIMIT.
export const MAX_UPLOAD_SIZE_BYTES = 5000000000

// Statuses meaning the upload stream was cut: 408 (idle timeout, HTTP/1.1),
// 504, and 0 (HTTP/2 RST_STREAM/GOAWAY surfaces as a transport error, no status).
export const UPLOAD_TIMEOUT_STATUSES = [0, 408, 504]
