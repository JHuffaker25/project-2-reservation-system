package com.skillstorm.backend.Repositories;

import com.skillstorm.backend.Models.Room;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface RoomRepository extends MongoRepository<Room, Long> {
    // Custom query methods if needed
}
