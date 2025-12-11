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
}
