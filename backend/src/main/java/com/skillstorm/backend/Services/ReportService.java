package com.skillstorm.backend.Services;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.skillstorm.backend.Models.Transaction;
import com.skillstorm.backend.Repositories.TransactionRepository;

@Service
public class ReportService {

    private final TransactionRepository transactionRepository;

    public ReportService(TransactionRepository transactionRepository) {
        this.transactionRepository = transactionRepository;
    }

    // Financial Summary Report
    public Map<String, Object> getFinancialSummary(LocalDate startDate, LocalDate endDate) {
        List<Transaction> transactions = transactionRepository.findAll().stream()
            .filter(tx -> tx.getAuthorizedAt() != null)
            .filter(tx -> {
                LocalDate txDate = tx.getAuthorizedAt().toLocalDate();
                return !txDate.isBefore(startDate) && !txDate.isAfter(endDate);
            })
            .toList();

        long totalRevenue = transactions.stream()
            .filter(tx -> "CAPTURED".equals(tx.getTransactionStatus()))
            .mapToLong(Transaction::getAmount)
            .sum();

        long totalPending = transactions.stream()
            .filter(tx -> "requires_capture".equals(tx.getTransactionStatus()))
            .mapToLong(Transaction::getAmount)
            .sum();

        long totalCancelled = transactions.stream()
            .filter(tx -> "CANCELLED".equals(tx.getTransactionStatus()))
            .mapToLong(Transaction::getAmount)
            .sum();

        return Map.of(
            "startDate", startDate.toString(),
            "endDate", endDate.toString(),
            "totalRevenue", totalRevenue / 100.0,
            "totalPending", totalPending / 100.0,
            "totalCancelled", totalCancelled / 100.0,
            "transactionCount", transactions.size(),
            "capturedCount", transactions.stream().filter(tx -> "CAPTURED".equals(tx.getTransactionStatus())).count(),
            "pendingCount", transactions.stream().filter(tx -> "requires_capture".equals(tx.getTransactionStatus())).count(),
            "cancelledCount", transactions.stream().filter(tx -> "CANCELLED".equals(tx.getTransactionStatus())).count()
        );
    }

    public List<Map<String, Object>> exportTransactionHistory(LocalDate startDate, LocalDate endDate) {
        return transactionRepository.findAll().stream()
            .filter(tx -> tx.getAuthorizedAt() != null)
            .filter(tx -> {
                LocalDate txDate = tx.getAuthorizedAt().toLocalDate();
                return !txDate.isBefore(startDate) && !txDate.isAfter(endDate);
            })
            .map(tx -> Map.<String, Object>of(
                "transactionId", tx.getId(),
                "paymentIntentId", tx.getPaymentIntentId(),
                "reservationId", tx.getReservationId() != null ? tx.getReservationId() : "",
                "userId", tx.getUserId() != null ? tx.getUserId() : "",
                "amount", tx.getAmount() / 100.0,
                "currency", tx.getCurrency().toUpperCase(),
                "status", tx.getTransactionStatus(),
                "authorizedAt", tx.getAuthorizedAt() != null ? tx.getAuthorizedAt().toString() : "",
                "capturedAt", tx.getCapturedAt() != null ? tx.getCapturedAt().toString() : "",
                "cancelledAt", tx.getCancelledAt() != null ? tx.getCancelledAt().toString() : ""
            ))
            .collect(Collectors.toList());
    }

    public List<Map<String, Object>> getDailyRevenue(LocalDate startDate, LocalDate endDate) {
        return transactionRepository.findAll().stream()
            .filter(tx -> "CAPTURED".equals(tx.getTransactionStatus()))
            .filter(tx -> tx.getCapturedAt() != null)
            .filter(tx -> {
                LocalDate txDate = tx.getCapturedAt().toLocalDate();
                return !txDate.isBefore(startDate) && !txDate.isAfter(endDate);
            })
            .collect(Collectors.groupingBy(
                tx -> tx.getCapturedAt().toLocalDate().toString(),
                Collectors.summingLong(Transaction::getAmount)
            ))
            .entrySet().stream()
            .map(entry -> Map.<String, Object>of(
                "date", entry.getKey(),
                "revenue", entry.getValue() / 100.0
            ))
            .sorted((a, b) -> ((String)a.get("date")).compareTo((String)b.get("date")))
            .collect(Collectors.toList());
    }
}