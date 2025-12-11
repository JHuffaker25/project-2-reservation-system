package com.skillstorm.backend.Services;

import java.util.Collections;
import java.util.List;

import org.springframework.stereotype.Service;

import com.skillstorm.backend.Models.Room;
import com.skillstorm.backend.Models.RoomType;
import com.skillstorm.backend.Repositories.RoomTypeRepository;

@Service
public class RoomTypeService {

    private final RoomTypeRepository roomTypeRepository;

    public RoomTypeService(RoomTypeRepository roomTypeRepository) {
        this.roomTypeRepository = roomTypeRepository;
    }

    public List<RoomType> getAllRoomTypes() {
        return roomTypeRepository.findAll();
    }

    public RoomType createRoomType(RoomType roomType) {
        return roomTypeRepository.save(roomType);
    }

    // GET method to find room by ID
    public RoomType findRoomById(String id) {
        RoomType roomType = roomTypeRepository.findById(id).orElse(null);

        if (roomType != null) {
            return roomType;
        } else {
            throw new IllegalArgumentException("No room type found with id: " + id);
        }
    }
}
