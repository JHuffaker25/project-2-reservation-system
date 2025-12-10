package com.skillstorm.backend.Services;

import java.util.List;

import org.springframework.stereotype.Service;

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
}
