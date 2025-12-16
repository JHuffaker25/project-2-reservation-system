import { baseApi } from '@/app/baseApi';
import type { Transaction } from '@/types/types';

export const transactionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTransactions: builder.query<Transaction[], void>({
      query: () => ({
        url: '/transactions/all',
        method: 'GET',
      }),
      transformResponse: (response: Transaction[]) => response,
    }),
    attachPaymentMethod: builder.mutation<any, { userId: string; paymentMethodId: string }>({
      query: ({ userId, paymentMethodId }) => ({
        url: `/users/${userId}/payment-methods/${paymentMethodId}`,
        method: 'POST',
      }),
    }),
  }),
  overrideExisting: false,
});

export const { useGetTransactionsQuery, useAttachPaymentMethodMutation } = transactionApi;
