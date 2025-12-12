package com.skillstorm.backend.Services;

import java.util.List;

import org.springframework.stereotype.Service;

import com.stripe.exception.StripeException;
import com.stripe.model.Customer;
import com.stripe.model.PaymentIntent;
import com.stripe.model.PaymentMethod;
import com.stripe.model.Refund;
import com.stripe.model.SetupIntent;
import com.stripe.param.CustomerCreateParams;
import com.stripe.param.PaymentIntentCreateParams;
import com.stripe.param.PaymentMethodAttachParams;
import com.stripe.param.PaymentMethodListParams;
import com.stripe.param.RefundCreateParams;
import com.stripe.param.SetupIntentCreateParams;

@Service
public class StripeService {

//CUSTOMER OPERATIONS////////////////////////////////////////////////////////////////////////////////////////////

    // Create a new Stripe customer (called when user registers)
    public Customer createCustomer(String email, String name) throws StripeException {
        return Customer.create(CustomerCreateParams.builder()
                .setEmail(email)
                .setName(name)
                .build());
    }

//PAYMENT METHOD OPERATIONS////////////////////////////////////////////////////////////////////////////////////////////

    // Attach a payment method to a customer (for frontend-tokenized payment methods)
    public PaymentMethod attachPaymentMethod(String paymentMethodId, String customerId) throws StripeException {
        PaymentMethod pm = PaymentMethod.retrieve(paymentMethodId);
        return pm.attach(PaymentMethodAttachParams.builder()
                .setCustomer(customerId)
                .build());
    }

    // List all payment methods for a customer
    public List<PaymentMethod> listPaymentMethods(String customerId) throws StripeException {
        return PaymentMethod.list(PaymentMethodListParams.builder()
                .setCustomer(customerId)
                .setType(PaymentMethodListParams.Type.CARD)
                .build()).getData();
    }

    // Create and attach a test payment method (for backend testing only)
    // Supported types: visa, mastercard, amex, discover, visa_debit
    public PaymentMethod createTestPaymentMethod(String cardType, String customerId) throws StripeException {
        String testPmId = switch (cardType.toLowerCase()) {
            case "mastercard" -> "pm_card_mastercard";
            case "amex" -> "pm_card_amex";
            case "discover" -> "pm_card_discover";
            case "visa_debit" -> "pm_card_visa_debit";
            default -> "pm_card_visa";
        };

        SetupIntent setupIntent = SetupIntent.create(SetupIntentCreateParams.builder()
                .setCustomer(customerId)
                .setPaymentMethod(testPmId)
                .setConfirm(true)
                .setAutomaticPaymentMethods(
                        SetupIntentCreateParams.AutomaticPaymentMethods.builder()
                                .setEnabled(true)
                                .setAllowRedirects(SetupIntentCreateParams.AutomaticPaymentMethods.AllowRedirects.NEVER)
                                .build())
                .build());

        return PaymentMethod.retrieve(setupIntent.getPaymentMethod());
    }

//PAYMENT INTENT OPERATIONS////////////////////////////////////////////////////////////////////////////////////////////

    // Create a payment intent with manual capture (holds funds until check-in)
    public PaymentIntent createPaymentIntent(Long amount, String currency, String customerId, String paymentMethodId)
            throws StripeException {
        return PaymentIntent.create(PaymentIntentCreateParams.builder()
                .setAmount(amount)
                .setCurrency(currency)
                .setCustomer(customerId)
                .setPaymentMethod(paymentMethodId)
                .setCaptureMethod(PaymentIntentCreateParams.CaptureMethod.MANUAL)
                .setAutomaticPaymentMethods(
                        PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                                .setEnabled(true)
                                .setAllowRedirects(PaymentIntentCreateParams.AutomaticPaymentMethods.AllowRedirects.NEVER)
                                .build())
                .setConfirm(true)
                .build());
    }

    // Capture a payment intent (called on check-in)
    public PaymentIntent capturePayment(String paymentIntentId) throws StripeException {
        return PaymentIntent.retrieve(paymentIntentId).capture();
    }

    // Cancel a payment intent (called on reservation cancellation)
    public PaymentIntent cancelPayment(String paymentIntentId) throws StripeException {
        return PaymentIntent.retrieve(paymentIntentId).cancel();
    }

    // Refund a captured payment
    public Refund refundPayment(String paymentIntentId) throws StripeException {
        return Refund.create(RefundCreateParams.builder()
                .setPaymentIntent(paymentIntentId)
                .build());
    }
}
