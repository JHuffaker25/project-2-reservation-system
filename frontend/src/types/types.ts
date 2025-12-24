export interface CheckoutData {
  roomId: string;
  roomTypeId: string;
  checkIn: string;
  checkOut: string;
  numGuests: number;
  totalPrice: number;
};

export interface Reservation {
  id?: string;
  userId: string;
  roomId: string;
  checkIn: string; // ISO date string
  checkOut: string; // ISO date string
  numGuests: number;
  totalPrice: number;
  paymentMethodId?: string;
  status?: string;
}

export interface PaymentMethod {
    paymentMethodId: string;
    customerId: string;
    type: string;
    card: {
      last4: string;
      expMonth: number;
      expYear: number;
      brand: string;
    };
}

export interface Preferences {
  emailNotifications: boolean,
  darkMode: boolean,
}

export interface User {
  email: string
  password?: string
  id?: string
  role?: string
  firstName?: string
  lastName?: string
  phone?: string
  preferences?: Preferences
}

export interface Room {
    id: string;
    roomNumber: string;
    typeId: string;
    status: string;
}

export interface Transaction {
  id: string;
  userId: string;
  reservationId: string;
  paymentIntentId: string;
  transactionStatus: 'CAPTURED' | 'PENDING' | 'FAILED' | 'REFUNDED';
  amount: number;
  currency: string;
  authorizedAt: string; // ISO string
  capturedAt: string; // ISO string
  cancelledAt: string; // ISO string
  transactionId?: string;
  last4?: string;
}

export interface UpdateReservationRequest {
  id: string;
  checkIn: string; // ISO date string
  checkOut: string; // ISO date string
  numGuests: number;
}