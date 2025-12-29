import type { User } from "@/types/types";
import { baseApi } from "@/app/baseApi";

export interface AuthResponse {
    user: User,
    token: string,
}

export const authApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // get the user details from the server. credentials are sent via baseQuery headers
        getUserData: builder.query<User, void>({
            query: () => ({
                url: "/users/me",
                method: "GET",
            }),
        }),
        createUser: builder.mutation<AuthResponse, Partial<User>>({
            query: (newUser) => ({
                url: "/users/create",
                method: "POST",
                body: newUser,
            }),
        }),
        logout: builder.mutation<{ message: string }, void>({
            query: () => ({
                url: "/users/logout",
                method: "POST",
                credentials: "include",
            }),
        }),
    }),
});

export const { useGetUserDataQuery, useLazyGetUserDataQuery, useCreateUserMutation, useLogoutMutation } = authApi;