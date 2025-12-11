package com.skillstorm.backend.Services;


import java.util.List;

import org.springframework.stereotype.Service;

import com.skillstorm.backend.Models.RoomType;
import com.skillstorm.backend.Repositories.RoomTypeRepository;

@Service
public class RoomTypeService {

//Repo injection
    private final RoomTypeRepository roomTypeRepository;

    public RoomTypeService(RoomTypeRepository roomTypeRepository) {
        this.roomTypeRepository = roomTypeRepository;
    }



//GET METHODS////////////////////////////////////////////////////////////////////////////////////////////

    //GET all room types
    public List<RoomType> getAllRoomTypes() {
        return roomTypeRepository.findAll();
    }

    //GET room type by ID
    public RoomType findRoomById(String id) {
        RoomType roomType = roomTypeRepository.findById(id).orElse(null);

        if (roomType != null) {
            return roomType;
        } else {
            throw new IllegalArgumentException("No room type found with id: " + id);
        }
    }



//POST METHODS///////////////////////////////////////////////////////////////////////////////////////////

    //POST new room type
    public RoomType createRoomType(RoomType roomType) {
        return roomTypeRepository.save(roomType);
    }
}
