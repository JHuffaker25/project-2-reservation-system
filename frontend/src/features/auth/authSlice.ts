import { createSlice } from "@reduxjs/toolkit"
import type { PayloadAction } from "@reduxjs/toolkit"
import type { User } from "@/types/types"

interface AuthState {
  isAuthenticated: boolean
  user: User | null
  error: string | null
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  error: null,
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login(state, action: PayloadAction<{ email: string }>) {
      state.isAuthenticated = true;
      state.user = { email: action.payload.email };
    },
    setUserSessionData(state, action: PayloadAction<User>) {
      state.user = {
        ...state.user,
        ...action.payload,
      };
    },
    // logout flow:
    // clearCredentials();
    // dispatch(logout());
    logout(state) {
      state.user = null;
      state.isAuthenticated = false;
    },
  },
});

export const { login, logout, setUserSessionData } = authSlice.actions;

export default authSlice.reducer;