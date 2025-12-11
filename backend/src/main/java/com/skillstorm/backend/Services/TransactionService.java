package com.skillstorm.backend.Services;

import java.util.List;

import org.springframework.stereotype.Service;

import com.skillstorm.backend.Models.Transaction;
import com.skillstorm.backend.Repositories.TransactionRepository;

@Service
public class TransactionService {
    
//Repo injection
    private final TransactionRepository transactionRepository;

    public TransactionService(TransactionRepository transactionRepository) {
        this.transactionRepository = transactionRepository;
    }



//GET METHODS////////////////////////////////////////////////////////////////////////////////////////////

    //GET all transactions 
    public List<Transaction> getAllTransactions() {
        return transactionRepository.findAll();
    }
}
