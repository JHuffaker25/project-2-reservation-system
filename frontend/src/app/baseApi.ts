import {createApi, fetchBaseQuery, type FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import type { RootState } from './store';
import type { BaseQueryFn } from '@reduxjs/toolkit/query';
import type { FetchArgs } from '@reduxjs/toolkit/query';

// Base query with Basic Auth headers
const baseQuery = fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
        const state = getState() as RootState;
        const { email, password } = state.auth.user || {};
        if (email && password) {
            const token = btoa(`${email}:${password}`);
            headers.set('Authorization', `Basic ${token}`);
        }
        return headers;
    }
});

// Base query wrapper that logs out the user on 401 responses
const baseQueryWithAuth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const result = await baseQuery(args, api, extraOptions);

  if (result.error?.status === 401) {
    api.dispatch({ type: 'auth/logout' });
  }

  return result;
};

// Create the base API slice
export const baseApi = createApi({
    baseQuery: baseQueryWithAuth,
    endpoints: () => ({}),
});