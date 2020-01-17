export interface UploadMessage {
  message: number | string;
  status: string;
  response?: SuccessfulUploadResponse;
}

interface SuccessfulUploadResponse {
  id: string;
  material: [{
    id: string,
    createForm: string,
  }];
}
