package com.skillstorm.backend.Models;

import java.time.LocalDateTime;

public class Transaction {
    private int transactionId;
    private String transactionStatus;
    private float amount;
    private LocalDateTime authorizedAt;
    private LocalDateTime capturedAt;
}
