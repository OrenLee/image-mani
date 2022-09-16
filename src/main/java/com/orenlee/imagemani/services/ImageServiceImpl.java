package com.orenlee.imagemani.services;

import com.orenlee.imagemani.exceptions.ErrMsg;
import com.orenlee.imagemani.exceptions.ImageManiException;
import com.orenlee.imagemani.models.Effects;
import com.orenlee.imagemani.models.Image;
import com.orenlee.imagemani.models.User;
import com.orenlee.imagemani.repos.ImageRepository;
import com.orenlee.imagemani.services.interfaces.ImageService;
import com.orenlee.imagemani.services.interfaces.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ImageServiceImpl implements ImageService {
  private final ImageRepository imageRepository;
  private final UserService userService;

  @Override
  public void uploadImage(String name, String type, byte[] data, Effects effects) throws ImageManiException {
    Optional<User> user = this.userService.getUser();
    Image processedImage = Image.builder()
      .name(name)
      .type(type)
      .image(data)
      .user(user.get())
      .effects(effects)
      .build();
    this.imageRepository.save(processedImage);
  }

  @Override
  public List<Image> getImagesByUserId() throws ImageManiException {
    long userId = this.userService.getUser().get().getId();
    return this.imageRepository.findImagesByUserId(userId);
  }

  @Override
  public void deleteImageById(long imageId) {
    this.imageRepository.deleteById(imageId);
  }

  @Override
  public void updateImage(long userId, long imageId, Effects effects) throws ImageManiException {
    Image image = this.imageRepository.findById(imageId).orElseThrow(() -> new ImageManiException(ErrMsg.IMAGE_DOES_NOT_EXIST));
    image.setEffects(effects);
    this.imageRepository.saveAndFlush(image);
  }
}
