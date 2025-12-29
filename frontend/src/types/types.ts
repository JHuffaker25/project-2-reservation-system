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
  roomNumber?: string;
  firstName?: string;
  lastName?: string;
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
  isGoogleUser?: boolean
}

export interface Room {
  id: string;
  roomNumber: string;
  typeId: string;
  status: string;
  datesReserved: string[]; // Array of ISO date strings
}

export interface Transaction {
  id: string;
  userId: string;
  reservationId: string;
  paymentIntentId: string;
  transactionStatus: 'CAPTURED' | 'requires_capture' | 'CANCELLED';
  amount: number;
  currency: string;
  authorizedAt: string; // ISO string
  capturedAt: string; // ISO string
  cancelledAt: string; // ISO string
  transactionId?: string;
  last4?: string;
  firstName?: string;
  lastName?: string;
}

export interface UpdateReservationRequest {
  id: string;
  checkIn: string; // ISO date string
  checkOut: string; // ISO date string
  numGuests: number;
  totalPrice: number;
  roomNumber: string;
}

export interface RoomType {
  id?: string;
  name: string;
  description: string;
  pricePerNight: number;
  maxGuests: number;
  amenities: string[];
  squareFootage: number;
  images: string[];
}