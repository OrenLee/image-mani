package com.orenlee.imagemani.models;

import lombok.*;

import javax.persistence.*;

@Entity
@Table(name = "images")
@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class Image {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private long id;

  private String name;
  private String type;

  @Embedded
  private Effects effects;

  @Column(name = "image", unique = false, nullable = false, length = 100000)
  private byte[] image;

  @ManyToOne
  @ToString.Exclude
  private User user;
}
