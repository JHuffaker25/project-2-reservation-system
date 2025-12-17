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

    //Update reservation (Required fields: id, checkIn, checkOut, numGuests)
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
    @DeleteMapping("delete/{id}")
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



/*POST MAPPINGS////////////////////////////////////////////////////////////////////////////////////////////    

    //CREATE new reservation (Required fields: resNumber, userId, roomId, checkIn, checkOut, numGuests, status, totalPrice)
    @PostMapping("/new")
    public ResponseEntity<Reservation> createReservation(@RequestBody Reservation reservation) {
         try {
            Reservation createdReservation = reservationService.createReservation(reservation);
            return new ResponseEntity<>(createdReservation, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
             return ResponseEntity.badRequest().header("Error", "Invalid reservation data: " + e.getMessage()).body(null);
         } catch (Exception e) {
               return ResponseEntity.internalServerError().header("Error", "There was an internal server error").body(null);
        }
            }



 */