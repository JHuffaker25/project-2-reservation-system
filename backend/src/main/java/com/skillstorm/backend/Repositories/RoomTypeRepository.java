package com.skillstorm.backend.Repositories;

import com.skillstorm.backend.Models.RoomType;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface RoomTypeRepository extends MongoRepository<RoomType, Long> {
    // Custom query methods if needed
}
