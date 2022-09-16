package com.orenlee.imagemani.controllers;

import com.orenlee.imagemani.exceptions.ImageManiException;
import com.orenlee.imagemani.models.Effects;
import com.orenlee.imagemani.models.Image;
import com.orenlee.imagemani.payload.request.UpdateImageDTO;
import com.orenlee.imagemani.services.interfaces.ImageService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequiredArgsConstructor
@CrossOrigin(origins = {"${app.url}"})
public class ImageController {
  private final ImageService imageService;

  @PostMapping("/image/")
  @ResponseStatus(HttpStatus.CREATED)
  public void uploadImage(@RequestParam("sepia") String sepia ,@RequestParam("saturation") String saturation,
                          @RequestParam("brightness") String brightness, @RequestParam("degrees") String degrees,
                          @RequestParam("isMirror") String isMirror, @RequestParam("isContrast") String isContrast,
                          @RequestParam("isBlur") String isBlur,
                          @RequestParam("image") MultipartFile file) throws IOException, ImageManiException {

    Effects effects = Effects.builder()
      .sepia(sepia)
      .saturation(saturation)
      .brightness(brightness)
      .degrees(Integer.parseInt(degrees))
      .isMirror(isMirror)
      .isContrast(isContrast)
      .isBlur(isBlur).build();
    this.imageService.uploadImage(file.getName(), file.getContentType(), file.getBytes(), effects);
  }

  @GetMapping("/image")
  @ResponseStatus(HttpStatus.OK)
  public List<Image> getImagesByUserId() throws IOException, ImageManiException {
    return this.imageService.getImagesByUserId();
  }

  @PatchMapping("/image")
  @ResponseStatus(HttpStatus.OK)
  public void updateImage(@RequestBody UpdateImageDTO updateImageDTO) throws ImageManiException {
    Effects effects = updateImageDTO.getEffects();
    long userId = updateImageDTO.getUserId();
    long imageId = updateImageDTO.getImageId();

    this.imageService.updateImage(userId, imageId, effects);
  }

  @DeleteMapping("/image/{imageId}")
  @ResponseStatus(HttpStatus.OK)
  public void deleteImage(@PathVariable long imageId) {
    this.imageService.deleteImageById(imageId);
  }
}
