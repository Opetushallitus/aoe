export interface BasicStudySubject {
  key: number;
  value: string;
  vuosiluokkakokonaisuudet: GradeEntity[];
}

export interface GradeEntity {
  key: number;
  vuosiluokkakokonaisuus: string;
  tavoitteet?: GradeEntityContents[];
  sisaltoalueet?: GradeEntityContents[];
}

export interface GradeEntityContents {
  key: number;
  value: BasicStudySubjectValue;
}

export interface BasicStudySubjectValue {
  fi: string;
  sv: string;
  _id: string;
}

export interface BasicStudyContent {
  key: number;
  value: string;
  subject: string;
}
