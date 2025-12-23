package com.skillstorm.backend.Controllers;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.skillstorm.backend.DTOs.CreateReservationRequest;
import com.skillstorm.backend.DTOs.UpdateReservationRequest;
import com.skillstorm.backend.Models.Reservation;
import com.skillstorm.backend.Services.ReservationService;
import com.stripe.exception.StripeException;


@RestController
@RequestMapping("/reservations")
public class ReservationController {

    private final ReservationService reservationService;

    public ReservationController(ReservationService reservationService) {
        this.reservationService = reservationService;
    }
    


//GET MAPPINGS////////////////////////////////////////////////////////////////////////////////////////////

    @GetMapping("/all")
    public ResponseEntity<List<Reservation>> getAllReservations() {
        List<Reservation> reservations = reservationService.getAllReservations();
        return ResponseEntity.ok(reservations);
    }

    // Get reservations by userId
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Reservation>> getReservationsByUserId(@PathVariable String userId) {
        List<Reservation> reservations = reservationService.getReservationsByUserId(userId);
        return ResponseEntity.ok(reservations);
    }



//POST MAPPINGS////////////////////////////////////////////////////////////////////////////////////////////

    // Create reservation with payment authorization (holds funds)
    @PostMapping("/new")
    public ResponseEntity<Object> createReservation(@RequestBody CreateReservationRequest request) {
        try {
            Reservation createdReservation = reservationService.createReservation(request);
            return new ResponseEntity<>(createdReservation, HttpStatus.CREATED);
        } catch (StripeException e) {
            return ResponseEntity.badRequest().header("Error", "Stripe error: " + e.getMessage()).build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().header("Error", "Invalid reservation data: " + e.getMessage()).build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().header("Error", "There was an internal server error").build();
        }
    }


    
//PUT MAPPINGS////////////////////////////////////////////////////////////////////////////////////////////

    // Check-in: captures the held payment
    @PutMapping("/{id}/check-in")
    public ResponseEntity<Object> checkIn(@PathVariable String id) {
        try {
            Reservation reservation = reservationService.checkIn(id);
            return ResponseEntity.ok(reservation);
        } catch (StripeException e) {
            return ResponseEntity.badRequest().header("Error", "Stripe error: " + e.getMessage()).build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().header("Error", "Invalid reservation data: " + e.getMessage()).build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().header("Error", "There was an internal server error").build();
        }
    }

    //Check-out: updates the reservation to completed status
    @PutMapping("/{id}/check-out")
    public ResponseEntity<Object> checkOut(@PathVariable String id) {
        try {
            Reservation reservation = reservationService.checkOut(id);
            return ResponseEntity.ok(reservation);
        } catch (StripeException e) {
            return ResponseEntity.badRequest().header("Error", "Stripe error: " + e.getMessage()).build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().header("Error", "Invalid reservation data: " + e.getMessage()).build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().header("Error", "There was an internal server error: " + e.getMessage()).build();
        }
    }

    // Cancel: releases the held payment
    @PutMapping("/{id}/cancel")
    public ResponseEntity<Object> cancelReservation(@PathVariable String id) {
        try {
            Reservation reservation = reservationService.cancelReservation(id);
            return ResponseEntity.ok(reservation);
        } catch (StripeException e) {
            return ResponseEntity.badRequest().header("Error", "Stripe error: " + e.getMessage()).build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().header("Error", "Invalid reservation data: " + e.getMessage()).build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().header("Error", "There was an internal server error").build();
        }
    }

    //Update reservation (Required fields: checkIn, checkOut, numGuests, totalPrice)
    @PutMapping("/{id}/update")
    public ResponseEntity<Object> updateReservation(@PathVariable String id, @RequestBody UpdateReservationRequest request) {
        try {
            Reservation reservation = reservationService.updateReservation(id, request);
            return ResponseEntity.ok(reservation);
        } catch (StripeException e) {
            return ResponseEntity.badRequest().header("Error", "Stripe error: " + e.getMessage()).build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().header("Error", "Invalid reservation data: " + e.getMessage()).build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().header("Error", "There was an internal server error").build();
        }
    }

//DELETE MAPPINGS////////////////////////////////////////////////////////////////////////////////////////////

    //DELETE reservation by ID
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteReservation(@PathVariable String id) {
        try {
            reservationService.cancelReservation(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
             return ResponseEntity.badRequest().header("Error", "Reservation not found: " + e.getMessage()).build();
        } catch (Exception e) {
           return ResponseEntity.internalServerError().header("Error", "There was an internal server error").build();
        }
    }
}