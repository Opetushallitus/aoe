export interface AoeUsersResponse {
  users: AoeUser[];
}

export interface AoeUser {
  id: string;
  firstname: string;
  lastname: string;
  fullName?: string;
  email: string;
}
