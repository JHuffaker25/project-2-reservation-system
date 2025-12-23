import { createApi, fetchBaseQuery, type FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn } from '@reduxjs/toolkit/query';
import type { FetchArgs } from '@reduxjs/toolkit/query';
import { getCredentials } from '@/features/auth/authMemory';

// Base query with Basic Auth headers
const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_BASE_URL,
  prepareHeaders: (headers) => {
    const creds = getCredentials();
    if (creds) {
      headers.set(
        "Authorization",
        `Basic ${btoa(`${creds.email}:${creds.password}`)}`
      );
    }
    return headers;
  },
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