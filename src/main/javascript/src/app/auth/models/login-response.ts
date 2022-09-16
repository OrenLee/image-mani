export interface LoginResponse {
  jwt: string;
  refreshToken: string;
  userId: number;
  expiresIn: number;
}
