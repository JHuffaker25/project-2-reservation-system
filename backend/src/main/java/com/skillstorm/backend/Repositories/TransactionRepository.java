package com.skillstorm.backend.Repositories;

import com.skillstorm.backend.Models.Transaction;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface TransactionRepository extends MongoRepository<Transaction, Integer> {
    // Custom query methods if needed
}
