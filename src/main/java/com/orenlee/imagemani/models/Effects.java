package com.orenlee.imagemani.models;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.Embeddable;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
@Embeddable
public class Effects {
  private String sepia;
  private String saturation;
  private String brightness;
  private int degrees;
  private String isMirror;
  private String isContrast;
  private String isBlur;
}
