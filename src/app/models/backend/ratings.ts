export interface Ratings {
  ratings: Rating[];
}

export interface Rating {
  materialId: string | number;
  ratingContent: number;
  ratingVisual: number;
  feedbackPositive: string;
  feedbackSuggest: string;
  feedbackPurpose: string;
  updatedAt: Date;
  firstName: string;
  lastName: string;
}
