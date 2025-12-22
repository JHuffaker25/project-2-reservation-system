import type { User } from "./authSlice";
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
    }),
});

export const { useGetUserDataQuery } = authApi;