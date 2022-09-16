package com.orenlee.imagemani.services.interfaces;

import com.orenlee.imagemani.exceptions.ImageManiException;
import com.orenlee.imagemani.models.Effects;
import com.orenlee.imagemani.models.Image;

import java.util.List;

public interface ImageService {
  void uploadImage(String name, String type, byte[] image, Effects effects) throws ImageManiException;
  List<Image> getImagesByUserId() throws ImageManiException;
  void deleteImageById(long imageId);
  void updateImage(long userId, long imageId, Effects effects) throws ImageManiException;
}
