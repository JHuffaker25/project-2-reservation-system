package com.skillstorm.backend.Controllers;import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.skillstorm.backend.Services.ReportService;


@RestController
@RequestMapping("/reports")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    //Get financial summary for a certain date range 
    //(capturedCount, pendingCount, cancelledCount, transactionCount, totalRevenue, totalPending, totalCancelled)
    // GET /reports/financial-summary?startDate=2025-01-01&endDate=2025-12-31
    @GetMapping("/financial-summary")
    public ResponseEntity<Map<String, Object>> getFinancialSummary(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        try {
            Map<String, Object> summary = reportService.getFinancialSummary(startDate, endDate);
            return ResponseEntity.ok(summary);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    //Get transactions for a certain date range 
    // GET /reports/transactions/export?startDate=2025-01-01&endDate=2025-12-31
    @GetMapping("/transactions/export")
    public ResponseEntity<List<Map<String, Object>>> exportTransactions(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        try {
            List<Map<String, Object>> transactions = reportService.exportTransactionHistory(startDate, endDate);
            return ResponseEntity.ok(transactions);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    //Get list revenues for each day in a date range
    // GET /reports/daily-revenue?startDate=2025-01-01&endDate=2025-12-31
    @GetMapping("/daily-revenue")
    public ResponseEntity<List<Map<String, Object>>> getDailyRevenue(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        try {
            List<Map<String, Object>> dailyRevenue = reportService.getDailyRevenue(startDate, endDate);
            return ResponseEntity.ok(dailyRevenue);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
