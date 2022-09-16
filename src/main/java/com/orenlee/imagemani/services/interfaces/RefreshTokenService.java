package com.orenlee.imagemani.services.interfaces;

import com.orenlee.imagemani.exceptions.ImageManiException;
import com.orenlee.imagemani.models.RefreshToken;

import java.util.Optional;

public interface RefreshTokenService {
  Optional<RefreshToken> findByToken(String token);
  RefreshToken createRefreshToken(Long userId);
  String getNewToken(String token) throws ImageManiException;
  int deleteByUserId(Long userId);
}
