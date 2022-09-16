package com.orenlee.imagemani.services;

import com.orenlee.imagemani.models.*;
import com.orenlee.imagemani.payload.response.AuthenticationResponse;
import com.orenlee.imagemani.exceptions.ErrMsg;
import com.orenlee.imagemani.exceptions.ImageManiException;
import com.orenlee.imagemani.registration.OnRegistrationCompleteEvent;
import com.orenlee.imagemani.repos.UserRepository;
import com.orenlee.imagemani.repos.VerificationTokenRepository;
import com.orenlee.imagemani.security.JwtUtil;
import com.orenlee.imagemani.services.interfaces.RefreshTokenService;
import com.orenlee.imagemani.services.interfaces.UserService;
import io.jsonwebtoken.impl.DefaultClaims;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService, UserDetailsService {
  private final UserRepository userRepository;
  private final JwtUtil jwtTokenUtil;
  private final PasswordEncoder passwordEncoder;

  private final AuthenticationManager authenticationManager;
  private final RefreshTokenService refreshTokenService;
  private final VerificationTokenRepository verificationTokenRepository;
  private final ApplicationEventPublisher eventPublisher;

  private long userId;
  private Optional<User> user;
  private RefreshToken refreshToken;
  private String jwt;
  private UserDetailsImpl userDetails;

  @Override
  public User addUser(final String email, final String password, final Locale locale, final String appUrl) throws ImageManiException {
    Optional<User> user = this.userRepository.findByEmail(email);

    //First time create user, Add and send Email
    if(!user.isPresent()){
        User userToDatabase = new User(email, passwordEncoder.encode(password));
        this.userRepository.save(userToDatabase);
        VerificationToken verificationToken = createVerificationTokenForUser(userToDatabase);
        //Send Email
        eventPublisher.publishEvent(new OnRegistrationCompleteEvent(userToDatabase, verificationToken.getToken(), locale, appUrl));
        return userToDatabase;
    }

    //User exists, if token is valid no need to send another one
    VerificationToken verificationToken = this.verificationTokenRepository.findByUser(user.get());
    if(!verificationToken.isTokenExpired()){
      throw new ImageManiException(ErrMsg.VALID_TOKEN_NEED_TO_VERITY);
    }

    //Token is not valid, generate new token and send Email
    generateNewVerificationToken(verificationToken.getToken());
    eventPublisher.publishEvent(new OnRegistrationCompleteEvent(user.get(), verificationToken.getToken(), locale, appUrl));

    return user.get();
  }

  @Override
  public AuthenticationResponse login(String email, String password) throws Exception {
    UserDetailsImpl userDetails = (UserDetailsImpl) loadUserByUsername(email);
    String jwt = jwtTokenUtil.generateToken(userDetails);
    Optional<User> user = this.userRepository.findByEmail(email);
    user.orElseThrow(() -> new ImageManiException(ErrMsg.EMAIL_AND_PASSWORD_INCORRECT));
    if(!user.get().getEnabled()){
      throw new ImageManiException(ErrMsg.EMAIL_IS_NOT_VERIFIED);
    }
    boolean isPasswordMatches = passwordEncoder.matches(password, user.get().getPassword());
    if(isPasswordMatches){
      userId = user.get().getId();
      this.user = user;
      this.refreshToken = refreshTokenService.createRefreshToken(userDetails.getId());
    } else {
      throw new ImageManiException(ErrMsg.EMAIL_AND_PASSWORD_INCORRECT);
    }

    return AuthenticationResponse.builder()
      .jwt(jwt)
      .refreshToken(this.refreshToken.getToken())
      .userId(userId)
      .expiresIn(jwtTokenUtil.extractExpiration(jwt).getTime())
      .build();
  }

  @Override
  public Optional<User> getUser() throws ImageManiException {
    if(this.user == null){
      String email = ((UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal()).getUsername();
      Optional<User> user = this.userRepository.findByEmail(email);
      user.orElseThrow(() -> new ImageManiException(ErrMsg.USER_WITH_EMAIL_DOES_NOT_EXIST));
      this.user = user;
    }
    return this.user;
  }

  private Map<String, Object> getMapFromIoJsonWebTokenClaims(DefaultClaims claims) {
    Map<String, Object> expectedMap = new HashMap<String, Object>();
    for (Map.Entry<String, Object> entry : claims.entrySet()) {
      expectedMap.put(entry.getKey(), entry.getValue());
    }
    return expectedMap;
  }

  @Override
  public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
    Optional<User> user = userRepository.findByEmail(email);
    user.orElseThrow(() -> new UsernameNotFoundException("Not found: " + email));

    return user.map(UserDetailsImpl::new).get();
  }

  public String generateTokenByEmail(String email) {
    UserDetailsImpl userDetails = (UserDetailsImpl)loadUserByUsername(email);
    return jwtTokenUtil.generateToken(userDetails);
  }

  @Override
  public void setJwt(String jwt) {
    this.jwt = jwt;
  }

  @Override
  public String getJwt(){
    return jwt;
  }


  @Override
  public boolean authenticateUser() {
    String email = jwtTokenUtil.extractUsername(jwt);
    UserDetailsImpl userDetails = (UserDetailsImpl) loadUserByUsername(email);
    return this.jwtTokenUtil.validateToken(jwt, userDetails);
  }

  @Override
  public void setUserDetails(UserDetailsImpl userDetails) {
    this.userDetails = userDetails;
  }

  public void setUser(Optional<User> user){
    this.user = user;
  }

  @Override
  public VerificationToken createVerificationTokenForUser(User user) {
    final String token = UUID.randomUUID().toString();
    final VerificationToken myToken = new VerificationToken(token, user);
    return verificationTokenRepository.save(myToken);
  }

  @Override
  public VerificationToken generateNewVerificationToken(final String existingVerificationToken) throws ImageManiException {
    VerificationToken vToken = verificationTokenRepository.findByToken(existingVerificationToken)
      .orElseThrow(() -> new ImageManiException(ErrMsg.VERIFY_TOKEN_INVALID));
    vToken.updateToken(UUID.randomUUID()
      .toString());
    vToken = verificationTokenRepository.save(vToken);
    return vToken;
  }

  @Override
  public void validateVerificationToken(String token) throws ImageManiException {
    final VerificationToken verificationToken =
      verificationTokenRepository.findByToken(token).orElseThrow(() -> new ImageManiException(ErrMsg.VERIFY_TOKEN_INVALID));
    if (verificationToken == null) {
      throw new ImageManiException(ErrMsg.VERIFY_TOKEN_INVALID);
    }

    final User user = verificationToken.getUser();
    final Calendar cal = Calendar.getInstance();
    if ((verificationToken.getExpiryDate()
      .getTime() - cal.getTime()
      .getTime()) <= 0) {
      verificationTokenRepository.delete(verificationToken);
      throw new ImageManiException(ErrMsg.VERIFY_TOKEN_IS_EXPIRED);
    }

    user.setEnabled(true);
    userRepository.save(user);
  }


}
