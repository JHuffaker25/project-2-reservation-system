package com.skillstorm.backend.DTOs;

import java.math.BigDecimal;
import java.time.LocalDate;

public record UpdateReservationRequest(
    LocalDate checkIn,
    LocalDate checkOut,
    Integer numGuests,
    BigDecimal totalPrice,
    Integer roomNumber
) {}
    
