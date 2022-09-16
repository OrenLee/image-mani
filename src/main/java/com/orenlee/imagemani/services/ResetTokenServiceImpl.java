package com.orenlee.imagemani.services;

import com.orenlee.imagemani.exceptions.ErrMsg;
import com.orenlee.imagemani.exceptions.ImageManiException;
import com.orenlee.imagemani.models.PasswordResetToken;
import com.orenlee.imagemani.models.RefreshToken;
import com.orenlee.imagemani.models.User;
import com.orenlee.imagemani.models.UserDetailsImpl;
import com.orenlee.imagemani.payload.response.AuthenticationResponse;
import com.orenlee.imagemani.registration.OnResetPasswordEvent;
import com.orenlee.imagemani.repos.PasswordResetTokenRepository;
import com.orenlee.imagemani.repos.UserRepository;
import com.orenlee.imagemani.security.JwtUtil;
import com.orenlee.imagemani.services.interfaces.RefreshTokenService;
import com.orenlee.imagemani.services.interfaces.ResetTokenService;
import com.orenlee.imagemani.services.interfaces.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
public class ResetTokenServiceImpl implements ResetTokenService {
  private final UserRepository userRepository;

  private final PasswordEncoder passwordEncoder;
  private final PasswordResetTokenRepository resetTokenRepository;
  private final ApplicationEventPublisher eventPublisher;

  private final UserService userService;
  private final RefreshTokenService refreshTokenService;

  private final JwtUtil jwtUtil;

  @Override
  public void resetPassword(final String email, final Locale locale, final String appUrl) throws ImageManiException {
    User user = userRepository.findByEmail(email).orElseThrow(() -> new ImageManiException(ErrMsg.USER_WITH_EMAIL_DOES_NOT_EXIST));
    final String token = UUID.randomUUID().toString();
    Date expiryDate = new Date();
    Calendar c = Calendar.getInstance();
    c.setTime(expiryDate);
    c.add(Calendar.DATE, 1);
    expiryDate = c.getTime();

    PasswordResetToken passwordResetToken = PasswordResetToken.builder()
      .token(token)
      .user(user)
      .expiryDate(expiryDate)
      .build();

    this.resetTokenRepository.save(passwordResetToken);
    eventPublisher.publishEvent(new OnResetPasswordEvent(user, token, locale, appUrl));
  }

  @Override
  public AuthenticationResponse changePassword(String token, String newPassword) throws ImageManiException {
    User user = validatePasswordResetToken(token);
    user.setPassword(passwordEncoder.encode(newPassword));
    this.userRepository.save(user);
    UserDetailsImpl userDetails = (UserDetailsImpl) loadUserByUsername(user.getEmail());
    String jwt = jwtUtil.generateToken(userDetails);
    RefreshToken refreshToken = refreshTokenService.createRefreshToken(userDetails.getId());
    this.userService.setUser(Optional.of(user));

    return AuthenticationResponse.builder()
      .jwt(jwt)
      .refreshToken(refreshToken.getToken())
      .userId(user.getId())
      .expiresIn(jwtUtil.extractExpiration(jwt).getTime())
      .build();
  }

  private User validatePasswordResetToken(String token) throws ImageManiException {
    final PasswordResetToken resetToken = resetTokenRepository.findByToken(token).orElseThrow(()-> new ImageManiException(ErrMsg.RESET_TOKEN_NOT_EXIST));

    final Calendar cal = Calendar.getInstance();
    if(resetToken.getExpiryDate().before(cal.getTime())){
      throw new ImageManiException(ErrMsg.RESET_TOKEN_EXPIRED);
    }

    return resetToken.getUser();
  }

  public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
    Optional<User> user = userRepository.findByEmail(email);
    user.orElseThrow(() -> new UsernameNotFoundException("Not found: " + email));

    return user.map(UserDetailsImpl::new).get();
  }

}
