import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { User } from "./authSlice";

export interface LoginRequest {
    email: string,
    password: string,
}

export interface AuthResponse {
    user: User,
    token: string,
}

export const authApi = createApi({
    reducerPath: "authApi",
    baseQuery: fetchBaseQuery({
        baseUrl: "/api",
    }),
    endpoints: (builder) => ({
        login: builder.mutation<AuthResponse, LoginRequest>({
            query: (credentials) => ({
                url: "/auth/login",
                method: "POST",
                body: credentials,
            }),
        }),

        logout: builder.mutation<void, void>({
            query: () => ({
                url: "/auth/logout",
                method: "POST",
            }),
        }),
    }),
});

export const { useLoginMutation, useLogoutMutation } = authApi;