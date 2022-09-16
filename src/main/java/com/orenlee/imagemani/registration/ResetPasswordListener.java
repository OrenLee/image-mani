package com.orenlee.imagemani.registration;

import com.orenlee.imagemani.models.User;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationListener;
import org.springframework.context.MessageSource;
import org.springframework.core.env.Environment;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ResetPasswordListener implements ApplicationListener<OnResetPasswordEvent> {
  private final MessageSource messages;
  private final JavaMailSender mailSender;
  private Environment env;

  @Value("${app.url")
  private String url;

  @Override
  public void onApplicationEvent(final OnResetPasswordEvent event) {
    this.resetPassword(event);
  }

  private void resetPassword(final OnResetPasswordEvent event) {
    final User user = event.getUser();
    final SimpleMailMessage email = constructEmailMessage(event, user);
    mailSender.send(email);
  }

  private SimpleMailMessage constructEmailMessage(final OnResetPasswordEvent event, final User user) {
    final String recipientAddress = user.getEmail();
    final String subject = "Reset Password Confirmation";
    final String confirmationUrl = url + "/change-password?token=" + event.getToken();
    final String message = messages.getMessage("message.regSuccLink", null, "You registered successfully. To confirm your registration, please click on the below link.", event.getLocale());
    final SimpleMailMessage email = new SimpleMailMessage();
    email.setTo(recipientAddress);
    email.setSubject(subject);
    email.setText(message + " \r\n" + confirmationUrl);
    return email;
  }

}
