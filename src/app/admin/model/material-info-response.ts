export interface MaterialInfoResponse {
  name: MaterialInfoName[];
  owner: MaterialInfoOwner;
}

export interface MaterialInfoName {
  materialname: string;
  language: string;
}

export interface MaterialInfoOwner {
  firstname: string;
  lastname: string;
}
