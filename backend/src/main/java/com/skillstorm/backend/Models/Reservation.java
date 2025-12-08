package com.skillstorm.backend.Models;

import java.time.LocalDateTime;

import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "reservations")
public class Reservation {
    private long reservationId;
    private long roomId;
    private long userId;
    private LocalDateTime checkin;
    private LocalDateTime checkout;
    private byte numGuests;
    private String status;
    private String paymentStatus;
    private int totalPrice;
}
