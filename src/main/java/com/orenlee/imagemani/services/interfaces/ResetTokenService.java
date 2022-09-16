package com.orenlee.imagemani.services.interfaces;

import com.orenlee.imagemani.exceptions.ImageManiException;
import com.orenlee.imagemani.models.User;
import com.orenlee.imagemani.payload.response.AuthenticationResponse;

import java.util.Locale;
import java.util.Optional;

public interface ResetTokenService {
  void resetPassword(String email, final Locale locale, final String appUrl) throws ImageManiException;
  AuthenticationResponse changePassword(String token, String newPassword) throws ImageManiException;
}
