export interface Attachment {
  id: number;
  filepath: string;
  originalfilename: string;
  filesize: number;
  mimetype: string;
  format: string;
  filekey: string;
  filebucket: string;
  defaultfile: boolean;
  kind: string;
  label: string;
  srclang: string;
  materialid: string;
}
