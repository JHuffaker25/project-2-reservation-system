package com.skillstorm.backend.Services;

import java.util.List;
import org.springframework.stereotype.Service;
import com.skillstorm.backend.Models.Reservation;

import com.skillstorm.backend.Repositories.ReservationRepository;

@Service
public class ReservationService {
   
//Repo injection
    private final ReservationRepository reservationRepository;

	public ReservationService(ReservationRepository reservationRepository) {
		this.reservationRepository = reservationRepository;
	}

    

//GET METHODS////////////////////////////////////////////////////////////////////////////////////////////

    //GET all reservations
    public List<Reservation> getAllReservations() {
        return reservationRepository.findAll();
    }


    
//POST METHODS////////////////////////////////////////////////////////////////////////////////////////////

    //CREATE new reservation
    public Reservation createReservation(Reservation reservation) {
        // Validate all required fields from the Reservation model
        if (reservation.getResNumber() == null || reservation.getUserId() == null || reservation.getRoomId() == null ||
            reservation.getCheckIn() == null || reservation.getCheckOut() == null || reservation.getNumGuests() == null ||
            reservation.getStatus() == null || reservation.getTotalPrice() == null) {
            throw new IllegalArgumentException("Missing required fields: resNumber, userId, roomId, checkIn, checkOut, numGuests, status, totalPrice");
        }
        return reservationRepository.save(reservation);
    }


    
//DELETE METHODS////////////////////////////////////////////////////////////////////////////////////////////

    // Delete a reservation by ID
    public void deleteReservation(String id) {
        if (!reservationRepository.existsById(id)) {
            throw new IllegalArgumentException("Reservation with id " + id + " does not exist");
        }
        reservationRepository.deleteById(id);
    }
}
