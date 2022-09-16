package com.orenlee.imagemani.advices;

import com.orenlee.imagemani.exceptions.ImageManiException;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.Date;

@ControllerAdvice
@RestController
public class ImageManiControllerAdvice {
  @ExceptionHandler
  @ResponseStatus(HttpStatus.BAD_REQUEST)
  public ErrPayloadDetails handleException(ImageManiException e) {
    return ErrPayloadDetails.builder()
      .message(e.getMessage())
      .statusCode(e.getStatusCode())
      .timestamp(new Date())
      .build();
  }
}
