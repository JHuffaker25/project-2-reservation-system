package com.skillstorm.backend.DTOs;

import java.time.LocalDate;

public record UpdateReservationRequest(
    String id,
    LocalDate checkIn,
    LocalDate checkOut,
    Integer numGuests
) {}
    
