package com.skillstorm.backend.Services;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.skillstorm.backend.DTOs.CreateReservationRequest;
import com.skillstorm.backend.Models.AppUser;
import com.skillstorm.backend.Models.Reservation;
import com.skillstorm.backend.Repositories.AppUserRepository;
import com.skillstorm.backend.Repositories.ReservationRepository;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;

@Service
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final StripeService stripeService;
    private final AppUserRepository appUserRepository;

    public ReservationService(ReservationRepository reservationRepository, StripeService stripeService, 
                              AppUserRepository appUserRepository) {
        this.reservationRepository = reservationRepository;
        this.stripeService = stripeService;
        this.appUserRepository = appUserRepository;
    }

//GET METHODS////////////////////////////////////////////////////////////////////////////////////////////

    public List<Reservation> getAllReservations() {
        return reservationRepository.findAll();
    }

//POST METHODS////////////////////////////////////////////////////////////////////////////////////////////

    // Create reservation with payment authorization (holds funds)
    public Reservation createReservation(CreateReservationRequest request) throws StripeException {
        // Get user's Stripe customer ID
        Optional<AppUser> userOpt = appUserRepository.findById(request.userId());
        if (userOpt.isEmpty()) {
            throw new IllegalArgumentException("User not found");
        }
        AppUser user = userOpt.get();

        // Map DTO to Reservation entity
        Reservation reservation = new Reservation();
        reservation.setUserId(request.userId());
        reservation.setRoomId(request.roomId());
        reservation.setCheckIn(request.checkIn());
        reservation.setCheckOut(request.checkOut());
        reservation.setNumGuests(request.numGuests());
        reservation.setTotalPrice(request.totalPrice());

        // Convert price to cents for Stripe
        Long amountInCents = request.totalPrice().multiply(new java.math.BigDecimal(100)).longValue();

        // Create payment intent (authorizes but doesn't capture)
        PaymentIntent paymentIntent = stripeService.createPaymentIntent(
                amountInCents,
                "usd",
                user.getStripeCustomerId(),
                request.paymentMethodId());

        // Set reservation details
        reservation.setPaymentIntentId(paymentIntent.getId());
        reservation.setStatus("PENDING"); // Funds held, awaiting check-in

        return reservationRepository.save(reservation);
    }

//PUT METHODS////////////////////////////////////////////////////////////////////////////////////////////

    // Check-in: capture funds from payment intent
    public Reservation checkIn(String reservationId) throws StripeException {
        Reservation reservation = findReservationOrThrow(reservationId);

        if (!"PENDING".equals(reservation.getStatus())) {
            throw new IllegalArgumentException("Reservation is not pending");
        }

        // Capture funds
        stripeService.capturePayment(reservation.getPaymentIntentId());
        reservation.setStatus("CONFIRMED");

        return reservationRepository.save(reservation);
    }

    // Cancel reservation: release held funds
    public Reservation cancelReservation(String reservationId) throws StripeException {
        Reservation reservation = findReservationOrThrow(reservationId);

        if (!"PENDING".equals(reservation.getStatus())) {
            throw new IllegalArgumentException("Reservation is not pending");
        }

        // Cancel payment intent
        stripeService.cancelPayment(reservation.getPaymentIntentId());
        reservation.setStatus("CANCELLED");

        return reservationRepository.save(reservation);
    }

//DELETE METHODS////////////////////////////////////////////////////////////////////////////////////////////

    public void deleteReservation(String id) {
        if (!reservationRepository.existsById(id)) {
            throw new IllegalArgumentException("Reservation with id " + id + " does not exist");
        }
        reservationRepository.deleteById(id);
    }

//HELPER METHODS////////////////////////////////////////////////////////////////////////////////////////////

    private Reservation findReservationOrThrow(String reservationId) {
        Optional<Reservation> reservationOpt = reservationRepository.findById(reservationId);
        if (reservationOpt.isEmpty()) {
            throw new IllegalArgumentException("Reservation not found");
        }
        return reservationOpt.get();
    }
}


/*//POST METHODS////////////////////////////////////////////////////////////////////////////////////////////

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
} */