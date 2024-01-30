export interface UserData {
  userdata: {
    uid: string;
    name: string;
  };
  termsofusage: boolean;
  newRatings: boolean;
  almostExpired: boolean;
  termsUpdated: boolean;
  email: string;
  verifiedEmail: boolean;
  allowTransfer: boolean;
}
