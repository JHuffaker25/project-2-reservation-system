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


//POST METHODS////////////////////////////////////////////////////////////////////////////////////////////

    //CREATE new transaction
    public Transaction createTransaction(Transaction transaction) {
        // Validate all required fields from the Transaction model
        if (transaction.getPaymentIntentId() == null || transaction.getTransactionStatus() == null ||
            transaction.getAmount() == null || transaction.getCurrency() == null ||
            transaction.getAuthorizedAt() == null || transaction.getCapturedAt() == null) {
            throw new IllegalArgumentException("Missing required fields: paymentIntentId, transactionStatus, amount, currency, authorizedAt, capturedAt");
        }
        return transactionRepository.save(transaction);
    }



//DELETE METHODS////////////////////////////////////////////////////////////////////////////////////////////

    // Delete a transaction by ID
    public void deleteTransaction(String id) {
        if (!transactionRepository.existsById(id)) {
            throw new IllegalArgumentException("Transaction with id " + id + " does not exist");
        }
        transactionRepository.deleteById(id);
    }
}
