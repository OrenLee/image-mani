package com.orenlee.imagemani.payload.request;

import com.orenlee.imagemani.models.Effects;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UpdateImageDTO {
  private long userId;
  private long imageId;
  private Effects effects;
}
