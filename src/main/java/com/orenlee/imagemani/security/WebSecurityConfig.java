package com.orenlee.imagemani.security;

import com.orenlee.imagemani.filters.JwtRequestFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.NoOpPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.authentication.logout.LogoutFilter;

import java.util.Properties;

@EnableWebSecurity
@RequiredArgsConstructor
public class WebSecurityConfig extends WebSecurityConfigurerAdapter {
  private final JwtRequestFilter jwtRequestFilter;

  @Override
  protected void configure(HttpSecurity http) throws Exception {
    http.csrf().disable()
      .authorizeRequests()
                          .antMatchers("/").permitAll()
                          .antMatchers("/*").permitAll()
                          .antMatchers("/**/favicon.ico").permitAll()
                          .antMatchers("/signup/").permitAll()
                          .antMatchers("/image/*").permitAll()
                          .antMatchers("/image-new/*").permitAll()
                          .antMatchers("/login/").permitAll()
                          .antMatchers("/refresh-token/").permitAll()
                          .antMatchers("/verify-account/").permitAll()
                          .antMatchers("/reset-password/").permitAll()
                          .antMatchers("/change-password/").permitAll()
                          .antMatchers("/hello/").permitAll()
      .anyRequest().authenticated()
      .and().sessionManagement()
      .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
      .and().addFilterBefore(jwtRequestFilter, UsernamePasswordAuthenticationFilter.class);
  }

  @Override
  @Bean
  public AuthenticationManager authenticationManagerBean() throws Exception {
    return super.authenticationManagerBean();
  }

  @Bean
  public PasswordEncoder encoder() {
    return new BCryptPasswordEncoder();
  }

}
