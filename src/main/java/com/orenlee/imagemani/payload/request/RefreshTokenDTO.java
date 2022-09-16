package com.orenlee.imagemani.payload.request;

import lombok.Data;

@Data
public class RefreshTokenDTO {
  private String refreshToken;

  public String getRefreshToken() {
    return refreshToken;
  }
}
