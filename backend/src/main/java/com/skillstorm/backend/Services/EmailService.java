package com.skillstorm.backend.Services;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;
    private final String fromEmail;

    public EmailService(JavaMailSender mailSender, @Value("${spring.mail.username}") String fromEmail) {
        this.mailSender = mailSender;
        this.fromEmail = fromEmail;
    }

    // Send email
    public void sendEmail(String to, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
        } catch (Exception e) {
            // Log error but don't throw exception to avoid breaking the reservation flow
            System.err.println("Failed to send email to " + to + ": " + e.getMessage());
        }
    }

    // Send reservation confirmation email (when payment intent is created)
    public void sendReservationConfirmation(String email, String customerName, String reservationId,
            LocalDate checkIn, LocalDate checkOut, String roomType, double totalAmount) {
        String subject = "Reservation Confirmation - " + reservationId;

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMMM dd, yyyy");
        String checkInFormatted = checkIn.format(formatter);
        String checkOutFormatted = checkOut.format(formatter);

        String body = String.format("""
            Dear %s,

            Thank you for your reservation! Your booking has been confirmed.

            Reservation Details:
            ---------------------
            Reservation ID: %s
            Room Type: %s
            Check-in Date: %s
            Check-out Date: %s
            Total Amount: $%.2f

            Payment Status: A hold has been placed on your payment method for $%.2f.
            This amount will be charged when you check in.

            If you need to modify or cancel your reservation, please contact us as soon as possible.

            We look forward to welcoming you!

            Best regards,
            Group1 Hotel
            """,
            customerName, reservationId, roomType, checkInFormatted, checkOutFormatted,
            totalAmount / 100.0, totalAmount / 100.0);

        sendEmail(email, subject, body);
    }

    // Send check-in confirmation email (when payment is captured)
    public void sendCheckInConfirmation(String email, String customerName, String reservationId,
            String roomNumber, LocalDate checkOut, double amountCharged) {
        String subject = "Check-In Confirmation - " + reservationId;

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMMM dd, yyyy");
        String checkOutFormatted = checkOut.format(formatter);

        String body = String.format("""
            Dear %s,

            Welcome! You have successfully checked in.

            Check-In Details:
            -----------------
            Reservation ID: %s
            Room Number: %s
            Check-out Date: %s
            Amount Charged: $%.2f

            Your payment has been processed successfully.

            If you need any assistance during your stay, please contact the front desk.

            Enjoy your stay!

            Best regards,
            Group1 Hotel
            """,
            customerName, reservationId, roomNumber, checkOutFormatted,
            amountCharged / 100.0, checkOutFormatted);

        sendEmail(email, subject, body);
    }

    // Send cancellation confirmation email
    public void sendCancellationConfirmation(String email, String customerName, String reservationId) {
        String subject = "Reservation Cancellation - " + reservationId;

        String body = String.format("""
            Dear %s,

            Your reservation has been cancelled as requested.

            Reservation ID: %s

            The hold on your payment method has been released. You will not be charged.

            If you have any questions or would like to make a new reservation, please contact us.

            We hope to serve you in the future!

            Best regards,
            Group1 Hotel
            """,
            customerName, reservationId);

        sendEmail(email, subject, body);
    }
}
   