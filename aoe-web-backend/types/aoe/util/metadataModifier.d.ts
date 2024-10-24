export interface AlignmentObject {
  id: string;
  educationalmaterialid: string;
  alignmenttype: string;
  targetname: string;
  source: string;
  educationalframework: string;
  objectkey: string;
  targeturl?: string;
}

export interface MetadataResponse {
  dateMin: string;
  dateMax: string;
  materialPerPage: number;
  pageNumber: number;
  pageTotal: number;
  completeListSize: number;
  content: Record<string, unknown>[];
}
