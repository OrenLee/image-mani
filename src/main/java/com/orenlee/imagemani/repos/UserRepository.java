package com.orenlee.imagemani.repos;

import com.orenlee.imagemani.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    //@Query(value = "SELECT `id` FROM users WHERE email = :email AND password = :password", nativeQuery = true)
    User findByEmailAndPassword(String email, String password);
    boolean existsByEmail(String email);

    @Query(value = "SELECT CASE WHEN COUNT(c) > 0 THEN TRUE ELSE FALSE END" +
      "FROM users WHERE email = :email AND enabled = true"
      , nativeQuery = true)
    boolean isUserEnabled(@Param("email") String email);
}
