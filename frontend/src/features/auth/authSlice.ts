import { createSlice } from "@reduxjs/toolkit"
import type { PayloadAction } from "@reduxjs/toolkit"

type Preferences = {
    emailNotifications: boolean,
    darkMode: boolean,
}

export interface User {
  email: string
  password: string
  id?: string
  role?: string
  firstName?: string
  lastName?: string
  preferences?: Preferences
}

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
        login(state, action: PayloadAction<{ email: string; password: string; id?: string; error?: string }>) {
            if (action.payload.error) {
                state.user = null;
                state.isAuthenticated = false;
                state.error = action.payload.error;
            } else {
                state.user = {
                    email: action.payload.email,
                    password: action.payload.password,
                    id: action.payload.id,
                };
                state.isAuthenticated = true;
                state.error = null;
            }
        },

        setUserSessionData(state, action: PayloadAction<User>) {
            state.user = {
                ...state.user,
                ...action.payload,
            };
        },

        logout(state) {
            state.user = null;
            state.isAuthenticated = false;
        },
    },
});

export const { login, logout, setUserSessionData } = authSlice.actions;

export default authSlice.reducer;