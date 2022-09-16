package com.orenlee.imagemani.controllers;

import com.orenlee.imagemani.payload.request.*;
import com.orenlee.imagemani.payload.response.AuthenticationResponse;
import com.orenlee.imagemani.models.User;
import com.orenlee.imagemani.exceptions.ImageManiException;
import com.orenlee.imagemani.services.interfaces.RefreshTokenService;
import com.orenlee.imagemani.services.interfaces.ResetTokenService;
import com.orenlee.imagemani.services.interfaces.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;

@RestController
@RequiredArgsConstructor
@CrossOrigin(origins = {"${app.url}"})
public class UserController {
  private final UserService userService;
  private final RefreshTokenService refreshTokenService;
  private final ResetTokenService resetTokenService;


  @PostMapping("/signup")
  public ResponseEntity<?> addUser(final HttpServletRequest request, @RequestBody UserDTO userDTO) throws ImageManiException {
    User user = this.userService.addUser(userDTO.getEmail(), userDTO.getPassword(), request.getLocale(), getAppUrl(request));
    return new ResponseEntity<> (HttpStatus.OK);
  }

  @PostMapping("/login")
  public ResponseEntity<?> login(@RequestBody UserDTO userDTO) throws Exception {
    AuthenticationResponse response = this.userService.login(userDTO.getEmail(), userDTO.getPassword());
    return ResponseEntity.ok(response);
  }

  @PostMapping("/refresh-token")
  public ResponseEntity<?> refreshToken(@RequestBody RefreshTokenDTO request) throws Exception {
    // From the HttpRequest get the claims

    //AuthenticationResponse response = this.userService.refreshToken((io.jsonwebtoken.impl.DefaultClaims) request.getAttribute("claims"));
    String newToken = this.refreshTokenService.getNewToken(request.getRefreshToken());
    AuthenticationResponse response = AuthenticationResponse.builder().jwt(newToken).build();

    return ResponseEntity.ok(response);
  }

  @PatchMapping("/verify-account")
  public void verifyAccount(@RequestBody VerifyAccountDTO verifyAccountDTO) throws ImageManiException {
    this.userService.validateVerificationToken(verifyAccountDTO.getVerificationToken());
  }

  @PostMapping("/reset-password")
  public void resetPassword(final HttpServletRequest httpRequest, @RequestBody ResetPasswordDTO resetPasswordDTO) throws ImageManiException {
    this.resetTokenService.resetPassword(resetPasswordDTO.getEmail(), httpRequest.getLocale(), getAppUrl(httpRequest));
  }

  @PostMapping("/change-password")
  public ResponseEntity<?> resetPasswordConfirm(@RequestBody ChangePasswordDTO changePasswordDTO) throws ImageManiException {
    AuthenticationResponse response = this.resetTokenService.changePassword(changePasswordDTO.getResetToken(), changePasswordDTO.getNewPassword());
    return ResponseEntity.ok(response);
  }

  private String getAppUrl(final HttpServletRequest request) {
    return "http://" + request.getServerName() + ":" + request.getServerPort() + request.getContextPath();
  }

}
