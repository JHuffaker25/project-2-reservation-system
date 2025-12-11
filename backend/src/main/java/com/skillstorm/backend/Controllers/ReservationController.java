package com.skillstorm.backend.Controllers;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


import com.skillstorm.backend.Models.Reservation;

import com.skillstorm.backend.Services.ReservationService;

    @RestController
    @RequestMapping("/reservations")
    public class ReservationController {
        
//Service injection
	private final ReservationService reservationService;

	public ReservationController(ReservationService reservationService) {
		this.reservationService = reservationService;
	}

	
//GET MAPPINGS////////////////////////////////////////////////////////////////////////////////////////////

	//GET all reservations
	@GetMapping ("/all")
    public ResponseEntity<List<Reservation>> getAllReservations() {
        List<Reservation> reservations = reservationService.getAllReservations();
        return ResponseEntity.ok(reservations);
    }
}
