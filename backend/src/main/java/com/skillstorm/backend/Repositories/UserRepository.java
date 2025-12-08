package com.skillstorm.backend.Repositories;

import com.skillstorm.backend.Models.User;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface UserRepository extends MongoRepository<User, Integer> {
    // Custom query methods if needed
}
