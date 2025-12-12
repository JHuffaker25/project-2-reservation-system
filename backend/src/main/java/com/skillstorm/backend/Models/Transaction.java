package com.skillstorm.backend.Models;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "transactions")
public class Transaction {

    @Id
    private String id;

    //PROBABLY ADD THIS IN LATER, REMOVE IF NOT NEEDED
    //private String userId;

    private String paymentIntentId;

    private String transactionStatus;

    private BigDecimal amount;

    private String currency;

    private LocalDateTime authorizedAt;
    
    private LocalDateTime capturedAt;

    // Constructors
    public Transaction() {}

    public Transaction(String paymentIntentId, String transactionStatus, BigDecimal amount, 
                       String currency, LocalDateTime authorizedAt, LocalDateTime capturedAt) {
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

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
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
}
