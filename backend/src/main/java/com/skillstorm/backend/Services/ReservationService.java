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
import com.skillstorm.backend.Models.RoomType;
import com.skillstorm.backend.Models.Transaction;
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
    private final EmailService emailService;
    private final RoomTypeService roomTypeService;

    public ReservationService(ReservationRepository reservationRepository, StripeService stripeService,
                              AppUserRepository appUserRepository, TransactionService transactionService,
                              RoomService roomService, EmailService emailService, RoomTypeService roomTypeService) {
        this.reservationRepository = reservationRepository;
        this.stripeService = stripeService;
        this.appUserRepository = appUserRepository;
        this.transactionService = transactionService;
        this.roomService = roomService;
        this.emailService = emailService;
        this.roomTypeService = roomTypeService;
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

    //Get reservation by ID
    public Reservation getReservationById(String id) {
        Optional<Reservation> reservationOpt = reservationRepository.findById(id);
        if (reservationOpt.isEmpty()) {
            throw new IllegalArgumentException("No reservation found with id: " + id);
        }
        return reservationOpt.get();
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
        reservation.setFirstName(request.firstName());
        reservation.setLastName(request.lastName());
        reservation.setRoomNumber(request.roomNumber());

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
        Transaction transaction = transactionService.createTransactionfromPaymentIntent(
        paymentIntent, saved.getId(), request.userId());

        //Link the transaction to the reservation
        saved.setTransactionId(transaction.getId());
        reservationRepository.save(saved);

        // Update the room's datesReserved with the newly reserved dates
        List<LocalDate> updatedDatesReserved = new ArrayList<>(datesReserved != null ? datesReserved : new ArrayList<>());
        LocalDate reservedDate = request.checkIn();
        while (reservedDate.isBefore(request.checkOut())) {
            updatedDatesReserved.add(reservedDate);
            reservedDate = reservedDate.plusDays(1);
        }
        room.setDatesReserved(updatedDatesReserved);
        roomService.saveRoom(room);

        // Send reservation confirmation email
        RoomType roomType = roomTypeService.findRoomTypeById(room.getTypeId());
        emailService.sendReservationConfirmation(
            user.getEmail(),
            user.getFirstName(),
            saved.getId(),
            saved.getCheckIn(),
            saved.getCheckOut(),
            roomType.getName(),
            amountInCents.doubleValue()
        );

        return saved;
    }

//PUT METHODS////////////////////////////////////////////////////////////////////////////////////////////

    // Check-in: capture funds from payment intent
    public Reservation checkIn(String reservationId) throws StripeException {
        Reservation reservation = findReservationOrThrow(reservationId);

        if (!"PENDING".equals(reservation.getStatus())) {
            throw new IllegalArgumentException("Reservation is not pending");
        }

        // Get user and room information for email
        Optional<AppUser> userOpt = appUserRepository.findById(reservation.getUserId());
        if (userOpt.isEmpty()) {
            throw new IllegalArgumentException("User not found");
        }
        AppUser user = userOpt.get();
        Room room = roomService.findRoomById(reservation.getRoomId());

        // Capture funds
        PaymentIntent capturedIntent = stripeService.capturePayment(reservation.getPaymentIntentId());
        reservation.setStatus("CONFIRMED");

        // Update the corresponding transaction to CAPTURED
        transactionService.captureTransaction(reservation.getPaymentIntentId());

        Reservation saved = reservationRepository.save(reservation);

        // Send check-in confirmation email
        emailService.sendCheckInConfirmation(
            user.getEmail(),
            user.getFirstName(),
            saved.getId(),
            room.getRoomNumber().toString(),
            saved.getCheckOut(),
            capturedIntent.getAmount().doubleValue()
        );

        return saved;
    }

    //Check-out: updates the reservation to completed status
    public Reservation checkOut(String reservationId) throws StripeException {
        Reservation reservation = findReservationOrThrow(reservationId);
        if (!"CONFIRMED".equals(reservation.getStatus())) {
            throw new IllegalArgumentException("Reservation is not confirmed");
        }
        reservation.setStatus("COMPLETED");
        return reservationRepository.save(reservation);
    }
        
    // Cancel reservation: release held funds
    public Reservation cancelReservation(String reservationId) throws StripeException {
        Reservation reservation = findReservationOrThrow(reservationId);

        if (!"PENDING".equals(reservation.getStatus())) {
            throw new IllegalArgumentException("Reservation is not pending");
        }

        // Get user information for email
        Optional<AppUser> userOpt = appUserRepository.findById(reservation.getUserId());
        if (userOpt.isEmpty()) {
            throw new IllegalArgumentException("User not found");
        }
        AppUser user = userOpt.get();

        // Cancel payment intent
        stripeService.cancelPayment(reservation.getPaymentIntentId());
        reservation.setStatus("CANCELLED");

        //Cancel the corresponding transaction
        transactionService.cancelTransaction(reservation.getPaymentIntentId());

        // Release the room dates by removing them from the room's datesReserved list
        Room room = roomService.findRoomById(reservation.getRoomId());
        List<LocalDate> datesReserved = new ArrayList<>(room.getDatesReserved() != null ? room.getDatesReserved() : new ArrayList<>());

        // Remove reservation dates from the room's reserved dates
        LocalDate date = reservation.getCheckIn();
        while (date.isBefore(reservation.getCheckOut())) {
            datesReserved.remove(date);
            date = date.plusDays(1);
        }

        room.setDatesReserved(datesReserved);
        roomService.saveRoom(room);

        Reservation saved = reservationRepository.save(reservation);

        // Send cancellation confirmation email
        emailService.sendCancellationConfirmation(
            user.getEmail(),
            user.getFirstName(),
            saved.getId()
        );

        return saved;
    }

    //Update reservation (Required fields: checkIn, checkOut, numGuests, totalPrice)
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

        //Check that price is valid
        if (request.totalPrice().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Total price must be greater than 0");
        }

        // Get room and check availability BEFORE updating reservation
        Room room = roomService.findRoomById(reservation.getRoomId());
        List<LocalDate> datesReserved = new ArrayList<>(room.getDatesReserved() != null ? room.getDatesReserved() : new ArrayList<>());
        
        // Remove old reservation dates from the list to check availability
        LocalDate oldDate = reservation.getCheckIn();
        while (oldDate.isBefore(reservation.getCheckOut())) {
            datesReserved.remove(oldDate);
            oldDate = oldDate.plusDays(1);
        }

        // Verify that the new checkin and checkout dates are available
        LocalDate date = request.checkIn();
        while (date.isBefore(request.checkOut())) {
            if (datesReserved.contains(date)) {
                throw new IllegalArgumentException("Room is not available for the selected dates");
            }
            date = date.plusDays(1);
        }

        // Update reservation fields
        reservation.setCheckIn(request.checkIn());
        reservation.setCheckOut(request.checkOut());
        reservation.setNumGuests(request.numGuests());
        reservation.setTotalPrice(request.totalPrice());
        
        //STRIPE LOGIC///

        // Get user for Stripe customer ID and email
        Optional<AppUser> userOpt = appUserRepository.findById(reservation.getUserId());
        if (userOpt.isEmpty()) {
            throw new IllegalArgumentException("User not found");
        }
        AppUser user = userOpt.get();

        // Cancel old PaymentIntent and create new one with updated amount
        String oldPaymentIntentId = reservation.getPaymentIntentId();
        PaymentIntent oldPaymentIntent = PaymentIntent.retrieve(oldPaymentIntentId);
        String paymentMethodId = oldPaymentIntent.getPaymentMethod();
        
        if (paymentMethodId == null) {
            throw new IllegalArgumentException("Cannot update reservation: original payment method not found");
        }
        
        // Cancel the old PaymentIntent
        stripeService.cancelPayment(oldPaymentIntentId);
        
        // Create new PaymentIntent with updated amount
        Long amountInCents = request.totalPrice().multiply(BigDecimal.valueOf(100)).longValue();
        PaymentIntent newPaymentIntent = stripeService.createPaymentIntent(
                amountInCents,
                "usd",
                user.getStripeCustomerId(),
                paymentMethodId,
                user.getEmail());
        
        // Update reservation with new PaymentIntent ID
        reservation.setPaymentIntentId(newPaymentIntent.getId());
        
        // Update transaction with new PaymentIntent ID and amount
        Transaction transaction = transactionService.getTransactionByReservationId(reservation.getId());
        transaction.setPaymentIntentId(newPaymentIntent.getId());
        transaction.setAmount(amountInCents);
        transaction.setTransactionStatus(newPaymentIntent.getStatus());
        transactionService.updateTransaction(transaction);

        // Update reservation with transaction ID
        reservation.setTransactionId(transaction.getId());

        // Add new reservation dates to the list 
        LocalDate addDate = request.checkIn();
        while (addDate.isBefore(request.checkOut())) {
            if (!datesReserved.contains(addDate)) {
                datesReserved.add(addDate);
            }
            addDate = addDate.plusDays(1);
        }
        
        room.setDatesReserved(datesReserved);
        roomService.saveRoom(room);

        return reservationRepository.save(reservation);
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
