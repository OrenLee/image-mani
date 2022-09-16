package com.orenlee.imagemani.payload.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.io.Serializable;

@Data
@Builder
@AllArgsConstructor
public class AuthenticationResponse implements Serializable {
  private final String jwt;
  private final String refreshToken;
  private final long userId;
  private Long expiresIn;
}
