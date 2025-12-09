package com.skillstorm.backend.Repositories;

import com.skillstorm.backend.Models.AppUser;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface AppUserRepository extends MongoRepository<AppUser, Long> {
    // Custom query methods if needed
}
