package com.skillstorm.backend.Models;

import java.time.LocalDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "transactions")
public class Transaction {

    @Id
    private long transactionId;

    private String transactionStatus;

    private float amount;

    private LocalDateTime authorizedAt;
    
    private LocalDateTime capturedAt;
}
