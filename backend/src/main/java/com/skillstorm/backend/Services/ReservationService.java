package com.skillstorm.backend.Services;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.skillstorm.backend.DTOs.CreateReservationRequest;
import com.skillstorm.backend.DTOs.UpdateReservationRequest;
import com.skillstorm.backend.Models.AppUser;
import com.skillstorm.backend.Models.Reservation;
import com.skillstorm.backend.Models.Room;
import com.skillstorm.backend.Repositories.AppUserRepository;
import com.skillstorm.backend.Repositories.ReservationRepository;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;

@Service
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final StripeService stripeService;
    private final AppUserRepository appUserRepository;
    private final TransactionService transactionService;
    private final RoomService roomService;

    public ReservationService(ReservationRepository reservationRepository, StripeService stripeService, 
                              AppUserRepository appUserRepository, TransactionService transactionService, RoomService roomService) {
        this.reservationRepository = reservationRepository;
        this.stripeService = stripeService;
        this.appUserRepository = appUserRepository;
        this.transactionService = transactionService;
        this.roomService = roomService;
    }



//GET METHODS////////////////////////////////////////////////////////////////////////////////////////////

    // Get all reservations
    public List<Reservation> getAllReservations() {
        return reservationRepository.findAll();
    }

    // Get reservations by userId
    public List<Reservation> getReservationsByUserId(String userId) {
        return reservationRepository.findByUserId(userId);
    }



//POST METHODS////////////////////////////////////////////////////////////////////////////////////////////

    // Create reservation with payment authorization (holds funds)
    public Reservation createReservation(CreateReservationRequest request) throws StripeException {
        // Get user's Stripe customer ID
        Optional<AppUser> userOpt = appUserRepository.findById(request.userId());

        //Error handling
        if (userOpt.isEmpty()) {
            throw new IllegalArgumentException("User not found");
        }

        AppUser user = userOpt.get();

        //Check if date order is valid
        if (request.checkIn().isAfter(request.checkOut())) {
            throw new IllegalArgumentException("Check-in date must be before check-out date");
        }

        //Check if the given room that we are attempting to reserve is available
        // Room does not have any date between the check-in and check-out date in datesReserved
        Room room = roomService.findRoomById(request.roomId());
        List<LocalDate> datesReserved = room.getDatesReserved();

        // Check if any date in the reservation range is already reserved
        // Note: checkOut date is excluded (room is available for new check-ins on checkout day)
        //Could be made more optimal in real-world application, but fine for our purposes
        LocalDate date = request.checkIn();
        while (date.isBefore(request.checkOut())) {
            if (datesReserved != null && datesReserved.contains(date)) {
                throw new IllegalArgumentException("Room is not available for the selected dates");
            }
            date = date.plusDays(1);
        }

        //Check if numGuests is valid
        if (request.numGuests() <= 0) {
            throw new IllegalArgumentException("Number of guests must be greater than 0");
        }

        //Check that price is valid
        if(request.totalPrice().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Total price must be greater than 0");
        }

        // Map DTO to Reservation entity
        Reservation reservation = new Reservation();
        reservation.setUserId(request.userId());
        reservation.setRoomId(request.roomId());
        reservation.setCheckIn(request.checkIn());
        reservation.setCheckOut(request.checkOut());
        reservation.setNumGuests(request.numGuests());
        reservation.setTotalPrice(request.totalPrice());

        // Convert price to cents for Stripe
        Long amountInCents = request.totalPrice().multiply(BigDecimal.valueOf(100)).longValue();

        // Create payment intent (authorizes but doesn't capture)
        PaymentIntent paymentIntent = stripeService.createPaymentIntent(
                amountInCents,
                "usd",
                user.getStripeCustomerId(),
                request.paymentMethodId(),
                user.getEmail());

        // Set reservation details
        reservation.setPaymentIntentId(paymentIntent.getId());
        reservation.setStatus("PENDING"); // Funds held, awaiting check-in

        //Must make a new reservation object to get the id from the reservation (MONGO DB creates an id with the save)
        Reservation saved = reservationRepository.save(reservation);

        //Create a corresponding transaction with the reservation id
        transactionService.createTransactionfromPaymentIntent(paymentIntent, saved.getId(), request.userId());

        // Update the room's datesReserved with the newly reserved dates
        List<LocalDate> updatedDatesReserved = new ArrayList<>(datesReserved != null ? datesReserved : new ArrayList<>());
        LocalDate reservedDate = request.checkIn();
        while (reservedDate.isBefore(request.checkOut())) {
            updatedDatesReserved.add(reservedDate);
            reservedDate = reservedDate.plusDays(1);
        }
        room.setDatesReserved(updatedDatesReserved);
        roomService.saveRoom(room);

        return saved;
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

        // Update the corresponding transaction to CAPTURED
        transactionService.captureTransaction(reservation.getPaymentIntentId());

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

        //Cancel the corresponding transaction
        transactionService.cancelTransaction(reservation.getPaymentIntentId());

        return reservationRepository.save(reservation);
    }

    //Update reservation (Required fields: id, checkIn, checkOut, numGuests)
    public Reservation updateReservation(String id, UpdateReservationRequest request) throws StripeException {
        Reservation reservation = findReservationOrThrow(id);

        if (request.checkIn().isAfter(request.checkOut())) {
            throw new IllegalArgumentException("Check-in date must be before check-out date");
        }

        if (request.numGuests() <= 0) {
            throw new IllegalArgumentException("Number of guests must be greater than 0");
        }

        //Can only update if reservation is pending
        if (!"PENDING".equals(reservation.getStatus())) {
            throw new IllegalArgumentException("Reservation is not pending");
        }

        //Room availabliity check here

        reservation.setCheckIn(request.checkIn());
        reservation.setCheckOut(request.checkOut());
        reservation.setNumGuests(request.numGuests());

        //Update the corresponding transaction to UPDATED
        transactionService.captureTransaction(reservation.getPaymentIntentId());

        return reservationRepository.save(reservation);
    }

//DELETE METHODS////////////////////////////////////////////////////////////////////////////////////////////

/*  Maybe delete this later
    public void deleteReservation(String reservationId) {
        Reservation reservation = findReservationOrThrow(reservationId);
        reservationRepository.deleteById(reservationId);
        transactionService.cancelTransaction(reservation.getPaymentIntentId());
    }

    */

//HELPER METHODS////////////////////////////////////////////////////////////////////////////////////////////

    private Reservation findReservationOrThrow(String reservationId) {
        Optional<Reservation> reservationOpt = reservationRepository.findById(reservationId);
        if (reservationOpt.isEmpty()) {
            throw new IllegalArgumentException("Reservation not found");
        }
        return reservationOpt.get();
    }

    public Reservation getReservationById(String id) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'getReservationById'");
    }

}


/*//POST METHODS////////////////////////////////////////////////////////////////////////////////////////////

    //CREATE new reservation
    public Reservation createReservation(Reservation reservation) {
        // Validate all required fields from the Reservation model
        if (reservation.getUserId() == null || reservation.getRoomId() == null ||
            reservation.getCheckIn() == null || reservation.getCheckOut() == null || reservation.getNumGuests() == null ||
            reservation.getStatus() == null || reservation.getTotalPrice() == null) {
            throw new IllegalArgumentException("Missing required fields: userId, roomId, checkIn, checkOut, numGuests, status, totalPrice");
        }
        return reservationRepository.save(reservation);
    }


    
 */