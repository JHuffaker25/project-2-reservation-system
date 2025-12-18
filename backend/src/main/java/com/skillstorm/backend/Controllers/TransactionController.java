package com.skillstorm.backend.Controllers;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
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
    @GetMapping("user/{userId}")
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
    @GetMapping("reservation/{reservationId}")
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
    


//POST MAPPINGS////////////////////////////////////////////////////////////////////////////////////////////    

    /* 
    Probably makes sense to not have this endpoint, as transactions are created automatically when a payment intent is created.
    //CREATE new transaction (Required fields: transactionId, reservationId, amount, paymentMethod, transactionDate)
    @PostMapping("/new")
    public ResponseEntity<Transaction> createTransaction(@RequestBody Transaction transaction) {
        try {
            Transaction createdTransaction = transactionService.createTransaction(transaction);
            return new ResponseEntity<>(createdTransaction, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().header("Error", "Invalid transaction data: " + e.getMessage()).body(null);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().header("Error", "There was an internal server error").body(null);
        }
    }
*/



//DELETE MAPPINGS////////////////////////////////////////////////////////////////////////////////////////////

    /*
    Probably makes sense to not have this endpoint, as transactions are deleted automatically when a payment intent is deleted.
    //DELETE transaction by ID *
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteTransaction(@PathVariable String id) {
        try {
            transactionService.deleteTransaction(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
              return ResponseEntity.badRequest().header("Error", "Transaction not found: " + e.getMessage()).build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().header("Error", "There was an internal server error").build();
        }
    }
*/
}
