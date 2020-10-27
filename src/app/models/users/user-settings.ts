export interface UserSettings {
  notifications: {
    newRatings: boolean;
    almostExpired: boolean;
    termsUpdated: boolean;
  };
  email: string;
  allowTransfer: boolean;
}
