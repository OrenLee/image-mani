package com.orenlee.imagemani.payload.request;

import lombok.Data;

@Data
public class ChangePasswordDTO {
  private String resetToken;
  private String newPassword;
}
