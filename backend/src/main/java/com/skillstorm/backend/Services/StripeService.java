package com.skillstorm.backend.Services;

import com.stripe.exception.StripeException;
import com.stripe.model.*;
import com.stripe.param.*;
import org.springframework.stereotype.Service;
import java.util.List;

//
@Service
//isolated Stripe API calls
public class StripeService {

    // ==CUSTOMER OPERATIONS==

    //call when a new user is created (user service)
    public Customer createCustomer(String email, String name) throws StripeException {
        return Customer.create(CustomerCreateParams.builder()
            .setEmail(email)
            .setName(name)
            .build());
    }

    // ==PAYMENT OPERATIONS==

    // Create and attach a payment method to a customer
    //WARNING: This method is for dummy data only. If real transactions are needed, tokenize data on frontend.

    //call when a new payment method is added to a user (user service)
    public PaymentMethod createAndAttachPaymentMethod(String customerId,
            String number, int expMonth, int expYear, String cvc)
            throws StripeException {
        
        // Create Payment Method
        PaymentMethod pm = PaymentMethod.create(PaymentMethodCreateParams.builder()
                //Card details
                .setType(PaymentMethodCreateParams.Type.CARD)
                .setCard(PaymentMethodCreateParams.CardDetails.builder()
                        .setNumber(number)
                        .setExpMonth((long) expMonth)
                        .setExpYear((long) expYear)
                        .setCvc(cvc)
                        .build())
                .build());

        // Attach to Customer
        return pm.attach(PaymentMethodAttachParams.builder()
                .setCustomer(customerId)
                .build());
    }

    // List Payment Methods for a customer
    //Call when a user wants to see their payment methods (user service)
    public List<PaymentMethod> listPaymentMethods(String customerId)
            throws StripeException {
        return PaymentMethod.list(PaymentMethodListParams.builder()
                .setCustomer(customerId)
                .setType(PaymentMethodListParams.Type.CARD)
                .build()).getData();
    }

    // ==PAYMENT INTENT OPERATIONS==

    // Create a Payment Intent (these are used to track payment state)
    //call when a user books a reservation (reservation service)
    public PaymentIntent createPaymentIntent(Long amount, String currency,
            String customerId, String paymentMethodId) throws StripeException {
        
        //Create Payment with manual capture
        //What are capture methods? They define when the funds 
        //are actually captured from the customer's account.
        return PaymentIntent.create(PaymentIntentCreateParams.builder()
                .setAmount(amount)
                .setCurrency(currency)
                .setCustomer(customerId)
                .setPaymentMethod(paymentMethodId)
                .setCaptureMethod(PaymentIntentCreateParams.CaptureMethod.MANUAL)
                .setConfirm(true)
                .build());
    }

    // Capture a Payment Intent 
    //call when a user checks in to their reservation (reservation service)
    public PaymentIntent capturePayment(String paymentIntentId)
            throws StripeException {
        return PaymentIntent.retrieve(paymentIntentId).capture();
    }

    // Cancel a Payment Intent
    //call when a user wants to cancel a reservation before they check in (reservation service)
    public PaymentIntent cancelPayment(String paymentIntentId)
            throws StripeException {
        return PaymentIntent.retrieve(paymentIntentId).cancel();
    }

    // Refund a Payment Intent
    //call when a user wants to refund a payment after a reservation is cancelled (reservation service)
    public Refund refundPayment(String paymentIntentId) throws StripeException {
        return Refund.create(RefundCreateParams.builder()
                .setPaymentIntent(paymentIntentId)
                .build());
    }
}