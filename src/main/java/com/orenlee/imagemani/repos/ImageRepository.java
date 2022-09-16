package com.orenlee.imagemani.repos;

import com.orenlee.imagemani.models.Image;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ImageRepository extends JpaRepository<Image, Long> {
  @Query(value = "SELECT * FROM images WHERE user_id = :userId", nativeQuery = true)
  List<Image> findImagesByUserId(@Param("userId") long userId);
}
