package com.orenlee.imagemani.services;

import com.orenlee.imagemani.exceptions.ErrMsg;
import com.orenlee.imagemani.exceptions.ImageManiException;
import com.orenlee.imagemani.models.RefreshToken;
import com.orenlee.imagemani.models.User;
import com.orenlee.imagemani.models.UserDetailsImpl;
import com.orenlee.imagemani.repos.RefreshTokenRepository;
import com.orenlee.imagemani.repos.UserRepository;
import com.orenlee.imagemani.security.JwtUtil;
import com.orenlee.imagemani.services.interfaces.RefreshTokenService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

//https://www.bezkoder.com/spring-boot-refresh-token-jwt/
@Service
@RequiredArgsConstructor
public class RefreshTokenServiceImpl implements RefreshTokenService {
  private Long refreshTokenDurationMs = Long.valueOf(120000);
  private final RefreshTokenRepository refreshTokenRepository;
  private final UserRepository userRepository;
  private final JwtUtil jwtUtil;

  @Override
  public Optional<RefreshToken> findByToken(String token) {
    return refreshTokenRepository.findByToken(token);
  }

  @Override
  public RefreshToken createRefreshToken(Long userId) {
    User user = userRepository.findById(userId).get();
    String token = UUID.randomUUID().toString();
    RefreshToken refreshToken = RefreshToken.builder()
      .user(user)
      .expiryDate(Instant.now().plusMillis(refreshTokenDurationMs))
      .token(token)
      .build();
    refreshTokenRepository.save(refreshToken);

    return refreshToken;

  }

  @Override
  public String getNewToken(String token) throws ImageManiException {
    RefreshToken refreshToken = this.refreshTokenRepository.findByToken(token)
      .orElseThrow(() -> new ImageManiException(ErrMsg.REFRESH_TOKEN_NOT_EXISTS));

    verifyExpiration(refreshToken);
    UserDetailsImpl userDetails = (UserDetailsImpl) loadUserByUsername(refreshToken.getUser().getEmail());
    return jwtUtil.generateToken(userDetails);
  }

  private RefreshToken verifyExpiration(RefreshToken refreshToken) throws ImageManiException {
    if(refreshToken.getExpiryDate().compareTo(Instant.now()) < 0){
      refreshTokenRepository.delete(refreshToken);
      throw new ImageManiException(ErrMsg.REFRESH_TOKEN_EXPIRED);
    }
    return refreshToken;
  }

  @Transactional
  public int deleteByUserId(Long userId) {
    return refreshTokenRepository.deleteByUser(userRepository.findById(userId).get());
  }

  public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
    Optional<User> user = userRepository.findByEmail(email);
    user.orElseThrow(() -> new UsernameNotFoundException("Not found: " + email));

    return user.map(UserDetailsImpl::new).get();
  }

}
