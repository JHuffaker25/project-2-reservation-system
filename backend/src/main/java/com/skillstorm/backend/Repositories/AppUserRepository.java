package com.skillstorm.backend.Repositories;

import com.skillstorm.backend.Models.AppUser;

import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

public interface AppUserRepository extends MongoRepository<AppUser, String> {
    Optional<AppUser> findByEmail(String email);
}
