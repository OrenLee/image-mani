package com.orenlee.imagemani.filters;

import com.orenlee.imagemani.security.JwtUtil;
import io.jsonwebtoken.ExpiredJwtException;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Controller;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.servlet.HandlerExceptionResolver;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

//https://www.svlada.com/jwt-token-authentication-with-spring-boot/
//https://www.javainuse.com/webseries/spring-security-jwt/chap7
//https://github.com/koushikkothagal/spring-security-jwt/blob/master/src/main/java/io/javabrains/springsecurityjwt/
//EXCEPTION https://stackoverflow.com/questions/34595605/how-to-manage-exceptions-thrown-in-filters-in-spring
//https://stackoverflow.com/questions/55423580/how-to-set-response-status-code-in-filter-when-controller-returns-responseentity
//https://stackoverflow.com/questions/34595605/how-to-manage-exceptions-thrown-in-filters-in-spring
//https://stackoverflow.com/questions/30335157/make-simple-servlet-filter-work-with-controlleradvice
@Controller
@RequiredArgsConstructor
public class JwtRequestFilter extends OncePerRequestFilter {
  private final JwtUtil jwtUtil;

  @Autowired
  @Qualifier("handlerExceptionResolver")
  private  HandlerExceptionResolver resolver ;

  @SneakyThrows
  @Override
  protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
    String email = null;
    String jwt = null;

    jwt = extractJwtFromRequest(request);
    if(jwt == null){
      filterChain.doFilter(request, response);
      return;
    }

    response.setHeader("Access-Control-Allow-Origin", request.getHeader("Origin"));
    response.setHeader("Access-Control-Allow-Credentials", "true");
    response.setHeader("Access-Control-Allow-Methods", "POST, GET, PATCH, OPTIONS, DELETE");
    response.setHeader("Access-Control-Max-Age", "3600");
    response.setHeader("Access-Control-Allow-Headers", "Content-Type, Accept, X-Requested-With, remember-me");

    try{
      jwtUtil.extractExpiration(jwt).getTime();
      List<GrantedAuthority> role_name=new ArrayList<>();
      email = jwtUtil.extractUsername(jwt);
      UserDetails userDetails = new User(email, "",
        role_name);
      jwtUtil.extractExpiration(jwt).getTime();

      if(jwtUtil.validateToken(jwt, userDetails)){
        UsernamePasswordAuthenticationToken usernamePasswordAuthenticationToken = new UsernamePasswordAuthenticationToken(
          userDetails, null, userDetails.getAuthorities());
        usernamePasswordAuthenticationToken
          .setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
        SecurityContextHolder.getContext().setAuthentication(usernamePasswordAuthenticationToken);
      }
    } catch (ExpiredJwtException expiredJwtException){
      String requestURL = request.getRequestURL().toString();
      if(requestURL.contains("refresh-token")){
        allowForRefreshToken(expiredJwtException, request);
      } else {
        request.setAttribute("exception", expiredJwtException);
        final String expiredMsg = expiredJwtException.getMessage();
        logger.warn(expiredMsg);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        return;
      }
    } catch (BadCredentialsException badCredentialsException){
      request.setAttribute("exception", badCredentialsException);
    } catch (Exception exception){
      System.out.println(exception);
    }
      filterChain.doFilter(request, response);

  }
  private void allowForRefreshToken(ExpiredJwtException ex, HttpServletRequest request) {

    // create a UsernamePasswordAuthenticationToken with null values.
    UsernamePasswordAuthenticationToken usernamePasswordAuthenticationToken = new UsernamePasswordAuthenticationToken(
      null, null, null);
    // After setting the Authentication in the context, we specify
    // that the current user is authenticated. So it passes the
    // Spring Security Configurations successfully.
    SecurityContextHolder.getContext().setAuthentication(usernamePasswordAuthenticationToken);
    // Set the claims so that in controller we will be using it to create
    // new JWT
    request.setAttribute("claims", ex.getClaims());
  }

  private String extractJwtFromRequest(HttpServletRequest request){
    final String bearerToken  = request.getHeader("Authorization");
    if(bearerToken  != null && bearerToken.startsWith("Bearer ")) {
      return bearerToken.substring(7);
    }
    return null;
  }
}
