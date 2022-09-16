export interface AuthError {
  isUserAlreadyExist: boolean;
  isPasswordAndEmailIncorrect: boolean;
  isEmailVerify: boolean;
  isVerifyTokenValid: boolean;
  isNoResponse: boolean;
}
