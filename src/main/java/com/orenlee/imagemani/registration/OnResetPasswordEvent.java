package com.orenlee.imagemani.registration;

import com.orenlee.imagemani.models.User;
import org.springframework.context.ApplicationEvent;

import java.util.Locale;

public class OnResetPasswordEvent extends ApplicationEvent {
  private final String appUrl;
  private final Locale locale;
  private final User user;
  private final String token;

  public OnResetPasswordEvent(final User user, final String token, final Locale locale, final String appUrl) {
    super(user);
    this.user = user;
    this.locale = locale;
    this.appUrl = appUrl;
    this.token = token;
  }

  public String getAppUrl() {
    return appUrl;
  }

  public Locale getLocale() {
    return locale;
  }

  public User getUser() {
    return user;
  }

  public String getToken() {
    return token;
  }
}
