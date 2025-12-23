package com.skillstorm.backend.Services;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.skillstorm.backend.Models.Transaction;
import com.skillstorm.backend.Repositories.TransactionRepository;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.model.PaymentMethod;

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

        // Capture last4 digits of card from PaymentMethod
        try {
            if (paymentIntent.getPaymentMethod() != null) {
                PaymentMethod pm = PaymentMethod.retrieve(paymentIntent.getPaymentMethod());
                if (pm.getCard() != null) {
                    tx.setLast4(pm.getCard().getLast4());
                }
            }
        } catch (StripeException e) {
            System.err.println("Failed to retrieve payment method details: " + e.getMessage());
        }

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


//PUT METHODS////////////////////////////////////////////////////////////////////////////////////////////

    //UPDATE a transaction amount (used when reservation is updated)
    public Transaction updateTransaction(Transaction transaction) {
        transaction.setAuthorizedAt(LocalDateTime.now());
        return transactionRepository.save(transaction);
    }

    

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

}