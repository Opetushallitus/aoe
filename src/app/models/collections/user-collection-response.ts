export interface UserCollectionResponse {
  collections: [
    {
      id: string;
      publishedat: Date | null;
      name: string;
      emIds: string[];
    }
  ];
}
