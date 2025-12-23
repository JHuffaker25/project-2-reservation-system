package com.skillstorm.backend.Controllers;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.skillstorm.backend.Models.Transaction;
import com.skillstorm.backend.Services.TransactionService;

@RestController
@RequestMapping("/transactions")
public class TransactionController {
    
//Service injection
    private final TransactionService transactionService;

    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }



//GET MAPPINGS////////////////////////////////////////////////////////////////////////////////////////////

    //GET all transactions
    @GetMapping("/all")
    public ResponseEntity<List<Transaction>> getAllTransactions() {
        List<Transaction> transactions = transactionService.getAllTransactions();
        return ResponseEntity.ok(transactions);
    }

    //GET transaction by TRANSACTION ID
    @GetMapping("/{id}")
    public ResponseEntity<Transaction> getTransactionById(@PathVariable String id) {
        try {
            Transaction transaction = transactionService.getTransactionById(id);
            return ResponseEntity.ok(transaction);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().header("Error", "Transaction not found: " + e.getMessage()).build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().header("Error", "There was an internal server error").build();
        }
    }

    //GET transactions by USER ID
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Transaction>> getTransactionsByUserId(@PathVariable String userId) {
        try {
            List<Transaction> transactions = transactionService.getTransactionsByUserId(userId);
            return ResponseEntity.ok(transactions);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().header("Error", "User not found: " + e.getMessage()).build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().header("Error", "There was an internal server error").build();
        }

    }
    
    //GET transaction by RESERVATION ID
    @GetMapping("/reservation/{reservationId}")
    public ResponseEntity<Transaction> getTransactionByReservationId(@PathVariable String reservationId) {
        try {
            Transaction transaction = transactionService.getTransactionByReservationId(reservationId);
            return ResponseEntity.ok(transaction);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().header("Error", "Reservation not found: " + e.getMessage()).build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().header("Error", "There was an internal server error").build();
        }
    }
}