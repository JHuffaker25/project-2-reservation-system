package com.skillstorm.backend.DTOs;

import java.math.BigDecimal;
import java.time.LocalDate;

public record CreateReservationRequest(
    String userId,
    String roomId,
    LocalDate checkIn,
    LocalDate checkOut,
    Integer numGuests,
    BigDecimal totalPrice,
    String paymentMethodId,
    String firstName, 
    String lastName,
    Integer roomNumber
) {}
