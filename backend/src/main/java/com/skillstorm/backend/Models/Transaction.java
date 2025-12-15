package com.skillstorm.backend.Models;

import java.time.LocalDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "transactions")
public class Transaction {

    @Id
    private String id;

    //added recently, may delete later 
    private String userId;

    /*adding this will make lookups more optimal, but transaction - reservation are alrady linked through 
        paymentIntentId. Possibly delete later.
    */
    private String reservationId;

    private String paymentIntentId;

    private String transactionStatus;

    private Long amount;

    private String currency;

    private LocalDateTime authorizedAt;
    
    private LocalDateTime capturedAt;

    //added recently, may delete later 
    private LocalDateTime cancelledAt;

    // Constructors
    public Transaction() {}

    public Transaction(String userId, String reservationId, String paymentIntentId, String transactionStatus, Long amount, 
                       String currency, LocalDateTime authorizedAt, LocalDateTime capturedAt) {
        this.userId = userId;
        this.reservationId = reservationId;
        this.paymentIntentId = paymentIntentId;
        this.transactionStatus = transactionStatus;
        this.amount = amount;
        this.currency = currency;
        this.authorizedAt = authorizedAt;
        this.capturedAt = capturedAt;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getReservationId() {
        return reservationId;
    }

    public void setReservationId(String reservationId) {
        this.reservationId = reservationId;
    }

    public String getPaymentIntentId() {
        return paymentIntentId;
    }

    public void setPaymentIntentId(String paymentIntentId) {
        this.paymentIntentId = paymentIntentId;
    }

    public String getTransactionStatus() {
        return transactionStatus;
    }

    public void setTransactionStatus(String transactionStatus) {
        this.transactionStatus = transactionStatus;
    }

    public Long getAmount() {
        return amount;
    }

    public void setAmount(Long amount) {
        this.amount = amount;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public LocalDateTime getAuthorizedAt() {
        return authorizedAt;
    }

    public void setAuthorizedAt(LocalDateTime authorizedAt) {
        this.authorizedAt = authorizedAt;
    }

    public LocalDateTime getCapturedAt() {
        return capturedAt;
    }

    public void setCapturedAt(LocalDateTime capturedAt) {
        this.capturedAt = capturedAt;
    }

    public LocalDateTime getCancelledAt() {
        return cancelledAt;
    }

    public void setCancelledAt(LocalDateTime cancelledAt) {
        this.cancelledAt = cancelledAt;
    }
}
