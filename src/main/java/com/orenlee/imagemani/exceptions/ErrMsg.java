package com.orenlee.imagemani.exceptions;

public enum ErrMsg {
  EMAIL_AND_PASSWORD_INCORRECT("Email and password combination is incorrect", 11),
  USER_WITH_EMAIL_ALREADY_EXISTS("User with that email is already exists", 12),
  USER_WITH_EMAIL_DOES_NOT_EXIST("There is no user with that mail", 13),
  REFRESH_TOKEN_EXPIRED("Refresh token was expired. Please make a new sign in request", 21),
  REFRESH_TOKEN_NOT_EXISTS("Refresh token does not exists", 22),
  EMAIL_IS_NOT_VERIFIED("Email is not verified by the user", 31),
  VERIFY_TOKEN_INVALID("Verification token is invalid", 32),
  VERIFY_TOKEN_IS_EXPIRED("Verification token is expired", 33),
  VALID_TOKEN_NEED_TO_VERITY("Verification was already send in the last 24h", 34),
  IMAGE_DOES_NOT_EXIST("Image does not exists", 41),
  RESET_TOKEN_NOT_EXIST("Password Reset token doesn't exists", 51),
  RESET_TOKEN_EXPIRED("Password reset token has expired", 52);

  private String desc;
  private int statusCode;
  ErrMsg(String desc, int statusCode){
    this.desc = desc;
    this.statusCode = statusCode;
  }
  public String getDesc(){
    return desc;
  }
  public int getStatusCode() { return statusCode; }
}
