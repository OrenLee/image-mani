package com.orenlee.imagemani.services.interfaces;

import java.util.Locale;
import com.orenlee.imagemani.models.UserDetailsImpl;
import com.orenlee.imagemani.models.VerificationToken;
import com.orenlee.imagemani.payload.request.UserDTO;
import com.orenlee.imagemani.payload.response.AuthenticationResponse;
import com.orenlee.imagemani.models.User;
import com.orenlee.imagemani.exceptions.ImageManiException;
import io.jsonwebtoken.impl.DefaultClaims;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Optional;

public interface UserService {
  User addUser(final String email, final String password, final Locale locale, final String appUrl) throws ImageManiException;
  AuthenticationResponse login(String email, String password) throws Exception;
  Optional<User> getUser() throws ImageManiException;
  //AuthenticationResponse refreshToken(DefaultClaims claims);
  void setJwt(String jwt);
  String getJwt();
  boolean authenticateUser();
  void setUserDetails(UserDetailsImpl userDetails);
  VerificationToken createVerificationTokenForUser(final User user);
  VerificationToken generateNewVerificationToken(final String existingVerificationToken) throws ImageManiException;
  void validateVerificationToken(String verificationToken) throws ImageManiException;
  void setUser(Optional<User> user);
}
