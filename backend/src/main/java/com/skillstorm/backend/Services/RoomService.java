package com.skillstorm.backend.Services;

import com.skillstorm.backend.Models.Room;
import com.skillstorm.backend.Repositories.RoomRepository;
import org.springframework.stereotype.Service;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;
import java.time.LocalDate;

@Service
public class RoomService {

//Repo injection
    private final RoomRepository roomRepository;

    public RoomService(RoomRepository roomRepository) {
        this.roomRepository = roomRepository;
    }


// POST and DELETE METHODS////////////////////////////////////////////////////////////////////////////////////////////

    // Create a new room (all fields required)
    

    


    
//GET METHODS////////////////////////////////////////////////////////////////////////////////////////////

    //GET all rooms
    public List<Room> getAllRooms() {
        return roomRepository.findAll();
    }

    //GET room by ID
    public List<Room> findRoomById(String id) {
        Room room = roomRepository.findById(id).orElse(null);

        if (room != null) {
            return Collections.singletonList(room);
        } else {
            throw new IllegalArgumentException("No room found with id: " + id);
        }
    }

    // GET available rooms by dates and optional typeId (case-insensitive)
    public List<Room> findAvailableRooms(List<LocalDate> requestedDates, String typeId) {
        List<Room> allRooms = roomRepository.findAll();
        return allRooms.stream()
                .filter(room -> {
                    // If typeId is provided, filter case-insensitively
                    if (typeId != null && !typeId.isEmpty()) {
                        if (room.getTypeId() == null || !room.getTypeId().equalsIgnoreCase(typeId)) {
                            return false;
                        }
                    }
                    // Exclude rooms with any overlapping reserved dates
                    List<LocalDate> reserved = room.getDatesReserved();
                    if (reserved == null || reserved.isEmpty()) return true;
                    for (LocalDate date : requestedDates) {
                        if (reserved.contains(date)) {
                            return false;
                        }
                    }
                    return true;
                })
                .collect(Collectors.toList());
    }



//POST METHODS////////////////////////////////////////////////////////////////////////////////////////////

    //CREATE new room
    public Room createRoom(Room room) {
        // Validate all required fields
        if (room.getRoomNumber() == null || room.getTypeId() == null || room.getStatus() == null || room.getDatesReserved() == null) {
            throw new IllegalArgumentException("Missing required fields: roomNumber, typeId, status, datesReserved");
        }
        return roomRepository.save(room);
    }



//DELETE METHODS////////////////////////////////////////////////////////////////////////////////////////////

    // Delete a room by ID
    public void deleteRoom(String id) {
        if (!roomRepository.existsById(id)) {
            throw new IllegalArgumentException("Room with id " + id + " does not exist");
        }
        roomRepository.deleteById(id);
    }
}
