# Stripe.js Frontend Integration Guide

This guide explains how to integrate the frontend with the backend Stripe payment system.

---

## 1. Install Stripe.js

```bash
npm install @stripe/stripe-js @stripe/react-stripe-js
```

---

## 2. Initialize Stripe

Use your **publishable key** from the Stripe Dashboard (not the secret key).

```javascript
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe('pk_test_your_publishable_key');
```

---

## 3. Wrap Your App with Elements Provider

```jsx
import { Elements } from '@stripe/react-stripe-js';

function App() {
  return (
    <Elements stripe={stripePromise}>
      <YourPaymentForm />
    </Elements>
  );
}
```

---

## 4. Create Payment Form Component

```jsx
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

function PaymentForm({ userId }) {
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Step 1: Stripe.js tokenizes the card (PCI compliant - card never touches your server)
    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: elements.getElement(CardElement),
    });

    if (error) {
      console.error(error);
      return;
    }

    // Step 2: Send only the paymentMethod.id (pm_xxx) to your backend
    const response = await fetch(`/users/${userId}/payment-methods/${paymentMethod.id}`, {
      method: 'POST',
    });

    const result = await response.json();
    console.log('Payment method attached:', result);
  };

  return (
    <form onSubmit={handleSubmit}>
      <CardElement />
      <button type="submit" disabled={!stripe}>Add Card</button>
    </form>
  );
}
```

---

## 5. Test Card Numbers

Use these in Stripe **test mode**:

| Card Type   | Number              |
|-------------|---------------------|
| Visa        | 4242 4242 4242 4242 |
| Mastercard  | 5555 5555 5555 4444 |
| Amex        | 3782 822463 10005   |
| Discover    | 6011 1111 1111 1117 |

- **Expiry**: Any future date (e.g., 12/30)
- **CVC**: Any 3 digits (e.g., 123)
- **ZIP**: Any 5 digits (e.g., 12345)

---

## 6. Complete Reservation Flow

### Step 1: Create User
```http
POST /users/create
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "555-1234",
  "role": "GUEST"
}
```

### Step 2: Add Payment Method (Frontend)
After user enters card in `<CardElement>`, call:
```http
POST /users/{userId}/payment-methods/{paymentMethodId}
```

Response:
```json
{
  "paymentMethodId": "pm_1ABC123...",
  "type": "card",
  "customerId": "cus_XYZ...",
  "card": {
    "brand": "visa",
    "last4": "4242",
    "expMonth": 12,
    "expYear": 2030
  }
}
```

### Step 3: Create Reservation
```http
POST /reservations
Content-Type: application/json

{
  "userId": "user_id_here",
  "roomId": "room_id_here",
  "checkIn": "2025-12-20",
  "checkOut": "2025-12-25",
  "numGuests": 2,
  "totalPrice": 500.00,
  "paymentMethodId": "pm_1ABC123..."
}
```

This **holds funds** on the card (status: `PENDING`).

### Step 4a: Check-In (Capture Payment)
```http
PUT /reservations/{reservationId}/check-in
```

This **captures the held funds** (status: `CONFIRMED`).

### Step 4b: Cancel Reservation (Release Funds)
```http
PUT /reservations/{reservationId}/cancel
```

This **releases the hold** (status: `CANCELLED`).

---

## 7. Backend Testing (Without Frontend)

For backend-only testing with Postman, use the test endpoint:

```http
POST /users/{userId}/payment-methods/test?cardType=visa
```

Available card types: `visa`, `mastercard`, `amex`, `discover`, `visa_debit`

---

## 8. Stripe Dashboard

View all test payments at: https://dashboard.stripe.com/test/payments

---

## Environment Variables

Make sure these are set:

```
STRIPE_SECRET_KEY=sk_test_your_secret_key
STRIPE_PUBLIC_KEY=pk_test_your_publishable_key
```

