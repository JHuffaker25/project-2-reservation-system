import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { CheckoutData } from '@/types/types';
import type { Reservation } from '@/types/types';

interface ReservationState {
  checkoutData: CheckoutData | null;
  userReservations: Reservation[];
}

const initialState: ReservationState = {
  checkoutData: null,
  userReservations: [],
};

const reservationSlice = createSlice({
  name: 'reservations',
  initialState,
  reducers: {
    setCheckoutData(state, action: PayloadAction<CheckoutData>) {
      state.checkoutData = action.payload;
    },
    clearCheckoutData(state) {
      state.checkoutData = null;
    },
    setUserReservations(state, action: PayloadAction<Reservation[]>) {
      state.userReservations = action.payload;
    },
  },
});

export const { setCheckoutData, clearCheckoutData, setUserReservations } = reservationSlice.actions;
export default reservationSlice.reducer;
