export interface CollectionForm {
  id: string;
  name: string;
  keywords: [
    {
      key: string;
      value: string;
    }
  ];
  languages: string[];
  educationalRoles: [
    {
      key: string;
      value: string;
    }
  ];
  educationalUses: [
    {
      key: string;
      value: string;
    }
  ];
  accessibilityFeatures: [
    {
      key: string;
      value: string;
    }
  ];
  accessibilityHazards: [
    {
      key: string;
      value: string;
    }
  ];
  materials: CollectionFormMaterial[];
  description: string;
  headings: [
    {
      heading: string;
      description: string;
      priority: number;
    }
  ];
}

export interface CollectionFormMaterial {
  id: string;
  authors: CollectionFormMaterialAuthor[];
  license: {
    key: string;
    value: string;
  };
  name: {
    fi: string;
    sv: string;
    en: string;
  };
  priority: number;
}

export interface CollectionFormMaterialAuthor {
  author: string;
  organization: {
    key: string;
    value: string;
  };
}
