export interface Ratings {
  ratingsCount: string;
  averages: {
    content: string;
    visual: string;
  };
  name: {
    fi: string;
    sv: string;
    en: string;
  };
  ratings: Rating[];
}

export interface Rating {
  materialId: string;
  ratingContent: number;
  ratingVisual: number;
  feedbackPositive: string;
  feedbackSuggest: string;
  feedbackPurpose: string;
  updatedAt: Date;
  firstName?: string;
  lastName?: string;
}
