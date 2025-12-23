package com.skillstorm.backend.Services;


import java.util.List;

import org.springframework.stereotype.Service;

import com.skillstorm.backend.Models.RoomType;
import com.skillstorm.backend.Repositories.RoomTypeRepository;

import com.skillstorm.backend.Models.Reservation;
import com.skillstorm.backend.Models.Room;
import com.skillstorm.backend.Repositories.ReservationRepository;
import com.skillstorm.backend.Repositories.RoomRepository;

@Service
public class RoomTypeService {

//Repo injection
    private final RoomTypeRepository roomTypeRepository;
    private final ReservationRepository reservationRepository;
    private final RoomRepository roomRepository;

    public RoomTypeService(RoomTypeRepository roomTypeRepository, ReservationRepository reservationRepository, RoomRepository roomRepository) {
        this.roomTypeRepository = roomTypeRepository;
        this.reservationRepository = reservationRepository;
        this.roomRepository = roomRepository;
    }



//GET METHODS////////////////////////////////////////////////////////////////////////////////////////////

    //GET all room types
    public List<RoomType> getAllRoomTypes() {
        return roomTypeRepository.findAll();
    }

    //GET room type by ID
    public RoomType findRoomTypeById(String id) {
        RoomType roomType = roomTypeRepository.findById(id).orElse(null);

        if (roomType != null) {
            return roomType;
        } else {
            throw new IllegalArgumentException("No room type found with id: " + id);
        }
    }

    // Get RoomType by reservationId
    public RoomType getRoomTypeByReservationId(String reservationId) {
        Reservation reservation = reservationRepository.findById(reservationId)
            .orElseThrow(() -> new IllegalArgumentException("Reservation not found for id: " + reservationId));

        String roomId = reservation.getRoomId();

        Room room = roomRepository.findById(roomId)
            .orElseThrow(() -> new IllegalArgumentException("Room not found for id: " + roomId));

        String typeId = room.getTypeId();

        return roomTypeRepository.findById(typeId)
            .orElseThrow(() -> new IllegalArgumentException("RoomType not found for id: " + typeId));
    }



//POST METHODS////////////////////////////////////////////////////////////////////////////////////////////

    //CREATE new room type
    public RoomType createRoomType(RoomType roomType) {
        // Validate all required fields from the RoomType model
        if (roomType.getName() == null || roomType.getPricePerNight() == null ||
            roomType.getMaxGuests() == null || roomType.getSquareFootage() == null) {
            throw new IllegalArgumentException("Missing required fields: name, pricePerNight, maxGuests, squareFootage");
        }
        return roomTypeRepository.save(roomType);
    }



//DELETE METHODS////////////////////////////////////////////////////////////////////////////////////////////

    //Delete a room type by ID
    public void deleteRoomType(String id) {
        if (!roomTypeRepository.existsById(id)) {
            throw new IllegalArgumentException("Room type with id " + id + " does not exist");
        }
        roomTypeRepository.deleteById(id);
    }
}
