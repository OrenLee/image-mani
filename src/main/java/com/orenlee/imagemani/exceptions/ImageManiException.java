package com.orenlee.imagemani.exceptions;

import lombok.Data;

@Data
public class ImageManiException extends Exception {
  private int statusCode;
  private String errorDesc;

  public ImageManiException(ErrMsg errMsg){
    super(errMsg.getDesc());
    this.statusCode = errMsg.getStatusCode();
    this.errorDesc = errMsg.getDesc();
  }
}
