package com.orenlee.imagemani.models;

import lombok.*;

import javax.persistence.*;
import java.util.List;

@Entity
@Table(name = "users")
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Data
public class User {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private long id;

  private String email;

  @Column(name = "enabled")
  private boolean enabled;

  @Column(length = 60)
  private String password;

  @OneToMany(cascade = CascadeType.ALL)
  @Singular
  private List<Image> images;

  public User(String email, String encodedPassword){
    this.email = email;
    this.password = encodedPassword;
  }

  public boolean getEnabled(){
    return enabled;
  }
}
