package com.orenlee.imagemani.payload.request;

import lombok.Data;

@Data
public class VerifyAccountDTO {
  private String verificationToken;
}
