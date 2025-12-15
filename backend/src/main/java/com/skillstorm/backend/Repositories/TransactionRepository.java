package com.skillstorm.backend.Repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.skillstorm.backend.Models.Transaction;

public interface TransactionRepository extends MongoRepository<Transaction, String> {
    // Custom query methods if needed
    Optional<Transaction> findByReservationId(String reservationId);
    Optional<Transaction> findByPaymentIntentId(String paymentIntentId);
    List<Transaction> findAllByUserId(String userId);
}
