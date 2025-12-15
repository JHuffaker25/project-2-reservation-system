package com.skillstorm.backend.Services;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.skillstorm.backend.Models.Transaction;
import com.skillstorm.backend.Repositories.TransactionRepository;
import com.stripe.model.PaymentIntent;

@Service
public class TransactionService {
    
    private final TransactionRepository transactionRepository;

    public TransactionService(TransactionRepository transactionRepository) {
        this.transactionRepository = transactionRepository;
    }



//GET METHODS////////////////////////////////////////////////////////////////////////////////////////////

    //GET all transactions 
    public List<Transaction> getAllTransactions() {
        return transactionRepository.findAll();
    }

    //GET transaction by ID
    public Transaction getTransactionById(String id) {
        Optional<Transaction> txOpt = transactionRepository.findById(id);
        if (txOpt.isEmpty()) {
            throw new IllegalArgumentException("Transaction with id " + id + " does not exist");
        }
        return txOpt.get();
    }

    //GET transactions by USER ID
    public List<Transaction> getTransactionsByUserId(String userId) {
        List<Transaction> txs = transactionRepository.findAllByUserId(userId);
        if (txs.isEmpty()) {
            throw new IllegalArgumentException("No transactions found for user id " + userId);
        }
        return txs; 
    }

    //GET transaction by RESERVATION ID
    public Transaction getTransactionByReservationId(String reservationId) {
        Optional<Transaction> txOpt = transactionRepository.findByReservationId(reservationId);
        if (txOpt.isEmpty()) {
            throw new IllegalArgumentException("Transaction with reservation id " + reservationId + " does not exist");
        }
        return txOpt.get();
    }



//POST METHODS////////////////////////////////////////////////////////////////////////////////////////////


    //CREATE new transaction from PaymentIntent
    public Transaction createTransactionfromPaymentIntent(PaymentIntent paymentIntent, String reservationId, String userId) {
        Transaction tx = new Transaction();
        tx.setPaymentIntentId(paymentIntent.getId());
        tx.setTransactionStatus(paymentIntent.getStatus());
        tx.setAmount(paymentIntent.getAmount());
        tx.setCurrency(paymentIntent.getCurrency());
        tx.setAuthorizedAt(LocalDateTime.now());
        tx.setUserId(userId);
        tx.setReservationId(reservationId);
        return transactionRepository.save(tx);
    }

    //CAPTURE a transaction from a PaymentIntent
    public Transaction captureTransaction(String paymentIntentId) {
        Optional<Transaction> txOpt = transactionRepository.findByPaymentIntentId(paymentIntentId);
        if (txOpt.isEmpty()) {
            throw new IllegalArgumentException("Transaction with payment intent id " + paymentIntentId + " does not exist");
        }
        Transaction tx = txOpt.get();
        tx.setTransactionStatus("CAPTURED");
        tx.setCapturedAt(LocalDateTime.now());
        return transactionRepository.save(tx);
    }

    
/* 
    //CREATE new transaction **May delete**
    public Transaction createTransaction(Transaction transaction) {
        // Validate all required fields from the Transaction model
        if (transaction.getPaymentIntentId() == null || transaction.getTransactionStatus() == null ||
            transaction.getAmount() == null || transaction.getCurrency() == null ||
            transaction.getAuthorizedAt() == null || transaction.getCapturedAt() == null) {
            throw new IllegalArgumentException("Missing required fields: paymentIntentId, transactionStatus, amount, currency, authorizedAt, capturedAt");
        }
        return transactionRepository.save(transaction);
    }
*/


//DELETE METHODS////////////////////////////////////////////////////////////////////////////////////////////


    //CANCEL a transaction from a PaymentIntent
    public void cancelTransaction(String paymentIntentId) {
        Optional<Transaction> txOpt = transactionRepository.findByPaymentIntentId(paymentIntentId);
        if (txOpt.isEmpty()) {
            throw new IllegalArgumentException("Transaction with payment intent id " + paymentIntentId + " does not exist");
        }
        Transaction tx = txOpt.get();
        tx.setTransactionStatus("CANCELLED");
        tx.setCancelledAt(LocalDateTime.now());
        transactionRepository.save(tx);
    }

/* 
    //DELETE a transaction by ID **May delete**
    public void deleteTransaction(String id) {
        if (!transactionRepository.existsById(id)) {
            throw new IllegalArgumentException("Transaction with id " + id + " does not exist");
        }
        transactionRepository.deleteById(id);
    }
}
*/
}