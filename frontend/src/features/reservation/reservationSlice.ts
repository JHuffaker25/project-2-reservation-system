import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { CheckoutData } from '@/types/types';

interface ReservationState {
  checkoutData: CheckoutData | null;
}

const initialState: ReservationState = {
  checkoutData: null,
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
  },
});

export const { setCheckoutData, clearCheckoutData } = reservationSlice.actions;
export default reservationSlice.reducer;
