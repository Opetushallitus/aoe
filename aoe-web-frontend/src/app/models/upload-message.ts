export interface UploadMessage {
  message: number | string;
  status: string;
  response?: SuccessfulUploadResponse;
  visible?: boolean;
  statusHTTP?: number;
}

interface SuccessfulUploadResponse {
  id: string;
  material: [
    {
      id: string;
      createFrom: string;
    },
  ];
}
