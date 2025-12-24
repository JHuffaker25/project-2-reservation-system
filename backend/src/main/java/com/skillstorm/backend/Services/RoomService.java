package com.skillstorm.backend.Services;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.skillstorm.backend.Models.Room;
import com.skillstorm.backend.Repositories.RoomRepository;

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
        // Expand date range if only checkIn and checkOut are provided
        final List<LocalDate> datesToCheck;
        if (requestedDates != null && requestedDates.size() == 2) {
            LocalDate checkIn = requestedDates.get(0);
            LocalDate checkOut = requestedDates.get(1);
            // Generate all dates in the range (include checkin and exclude checkout)
            datesToCheck = new ArrayList<>();
            LocalDate date = checkIn;
            while (date.isBefore(checkOut)) {
                datesToCheck.add(date);
                date = date.plusDays(1);
            }
        } else {
            datesToCheck = requestedDates;
        }
        
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
                    for (LocalDate date : datesToCheck) {
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

    //UPDATE room details by id
    public Room updateRoom(String id, Room updatedRoom) {
        Room existingRoom = findRoomById(id);
        // Update fields (add more as needed)
        if (updatedRoom.getRoomNumber() != null) existingRoom.setRoomNumber(updatedRoom.getRoomNumber());
        if (updatedRoom.getTypeId() != null) existingRoom.setTypeId(updatedRoom.getTypeId());
        if (updatedRoom.getStatus() != null) existingRoom.setStatus(updatedRoom.getStatus());
        if (updatedRoom.getDatesReserved() != null) existingRoom.setDatesReserved(updatedRoom.getDatesReserved());
        return roomRepository.save(existingRoom);
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
