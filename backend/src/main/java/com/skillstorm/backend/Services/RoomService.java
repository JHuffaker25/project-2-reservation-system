package com.skillstorm.backend.Services;

import com.skillstorm.backend.Models.Room;
import com.skillstorm.backend.Repositories.RoomRepository;
import org.springframework.stereotype.Service;
import java.util.Collections;
import java.util.List;

@Service
public class RoomService {

    // Constructor injection of RoomRepository
    private final RoomRepository roomRepository;

    public RoomService(RoomRepository roomRepository) {
        this.roomRepository = roomRepository;
    }


    // GET method to find room by ID
    public List<Room> findRoomById(String id) {
        Room room = roomRepository.findById(id).orElse(null);

        if (room != null) {
            return Collections.singletonList(room);
        } else {
            throw new IllegalArgumentException("No room found with id: " + id);
        }
    }
}
