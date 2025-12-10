package com.skillstorm.backend.Models;

import java.math.BigDecimal;
import java.time.LocalDate;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "reservations")
public class Reservation {
   
    @Id
    private String id;

    private String resNumber;
    
    private String userId;

    private String roomId;
    
    private LocalDate checkIn;

    private LocalDate checkOut;

    private Integer numGuests;

    private String status;

    private BigDecimal totalPrice;

    // Constructors
    public Reservation() {}

    public Reservation(String resNumber, String userId, String roomId, LocalDate checkIn, 
                       LocalDate checkOut, Integer numGuests, String status, BigDecimal totalPrice) {
        this.resNumber = resNumber;
        this.userId = userId;
        this.roomId = roomId;
        this.checkIn = checkIn;
        this.checkOut = checkOut;
        this.numGuests = numGuests;
        this.status = status;
        this.totalPrice = totalPrice;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getResNumber() {
        return resNumber;
    }

    public void setResNumber(String resNumber) {
        this.resNumber = resNumber;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getRoomId() {
        return roomId;
    }

    public void setRoomId(String roomId) {
        this.roomId = roomId;
    }

    public LocalDate getCheckIn() {
        return checkIn;
    }

    public void setCheckIn(LocalDate checkIn) {
        this.checkIn = checkIn;
    }

    public LocalDate getCheckOut() {
        return checkOut;
    }

    public void setCheckOut(LocalDate checkOut) {
        this.checkOut = checkOut;
    }

    public Integer getNumGuests() {
        return numGuests;
    }

    public void setNumGuests(Integer numGuests) {
        this.numGuests = numGuests;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public BigDecimal getTotalPrice() {
        return totalPrice;
    }

    public void setTotalPrice(BigDecimal totalPrice) {
        this.totalPrice = totalPrice;
    }
}
