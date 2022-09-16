package com.orenlee.imagemani.advices;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ErrPayloadDetails {
  private int statusCode;
  private Date timestamp;
  private String message;
}
