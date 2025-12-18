package com.skillstorm.backend.Services;

import com.skillstorm.backend.Models.Room;
import com.skillstorm.backend.Repositories.RoomRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

@Service
public class RoomService {

//Repo injection
    private final RoomRepository roomRepository;

    public RoomService(RoomRepository roomRepository) {
        this.roomRepository = roomRepository;
    }



    
//GET METHODS////////////////////////////////////////////////////////////////////////////////////////////

    //GET all rooms
    public List<Room> getAllRooms() {
        return roomRepository.findAll();
    }

    //GET room by ID
    public Room findRoomById(String id) {
        Optional<Room> roomOpt = roomRepository.findById(id);
        if (roomOpt.isEmpty()) {
            throw new IllegalArgumentException("No room found with id: " + id);
        }
        return roomOpt.get();
    
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



//POST and PUT METHODS////////////////////////////////////////////////////////////////////////////////////////////

    //CREATE new room
    public Room createRoom(Room room) {
        // Validate all required fields
        if (room.getRoomNumber() == null || room.getTypeId() == null || room.getStatus() == null || room.getDatesReserved() == null) {
            throw new IllegalArgumentException("Missing required fields: roomNumber, typeId, status, datesReserved");
        }
        return roomRepository.save(room);
    }

    //UPDATE room (for updating datesReserved)
    public Room saveRoom(Room room) {
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
