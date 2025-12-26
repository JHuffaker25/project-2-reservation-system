package com.skillstorm.backend.Repositories;

import java.util.Optional;

import com.skillstorm.backend.Models.Room;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface RoomRepository extends MongoRepository<Room, String> {
    Optional<Room> findByRoomNumber(Integer roomNumber);
}
