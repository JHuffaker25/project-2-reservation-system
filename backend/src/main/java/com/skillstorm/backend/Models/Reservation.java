package com.skillstorm.backend.Models;

import java.time.LocalDateTime;

public class Reservation {
    private int reservationId;
    private int roomId;
    private int userId;
    private LocalDateTime checkin;
    private LocalDateTime checkout;
    private byte numGuests;
    private String status;
    private String paymentStatus;
    private int totalPrice;
}
