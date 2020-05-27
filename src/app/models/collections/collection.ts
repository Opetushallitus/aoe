export interface Collection {
  collection: {
    id: string;
    publishedat: Date | null;
    name: string;
  };
  educationalmaterials: [
    {
      id: string;
      author: [
        {
          authorname: string;
          organization: string;
          organizationkey: string;
        }
      ];
      name: {
        fi: string;
        sv: string;
        en: string;
      };
    }
  ];
}
