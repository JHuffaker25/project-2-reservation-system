import { createSlice } from "@reduxjs/toolkit"
import type { PayloadAction } from "@reduxjs/toolkit"

type Preferences = {
    emailNotifications: boolean,
    darkMode: boolean,
}

export interface User {
  id: string
  email: string
  name?: string
  role?: string
  preferences?: Preferences
}

interface AuthState {
    isAuthenticated: boolean
    user: User | null
    loading: boolean
    error: string | null
}

const initialState: AuthState = {
    isAuthenticated: false,
    user: null,
    loading: true,
    error: null,
}

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        startAuth(state) {
            state.loading = true;
            state.error = null;
        },
        setAuthResolved(state) {
            state.loading = false;
        },
        loginSuccess(state, action: PayloadAction<User>) {
            state.user = action.payload;
            state.isAuthenticated = true;
            state.loading = false;
        },
        logout(state) {
            state.user = null;
            state.isAuthenticated = false;
            state.loading = false;
        },
    },
});

export const { startAuth, setAuthResolved, loginSuccess, logout } = authSlice.actions;

export default authSlice.reducer;