import { baseApi } from '@/app/baseApi';
import type { User, Preferences } from '@/types/types';


export interface PaymentMethod {
  paymentMethodId: string;
  customerId: string;
  type: string;
  card: {
    last4: string;
    expMonth: number;
    expYear: number;
    brand: string;
  };
}

export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUserPaymentMethods: builder.query<PaymentMethod[], string>({
      query: (userId) => ({
        url: `/users/${userId}/payment-methods`,
        method: 'GET',
      }),
      transformResponse: (response: any[]) =>
        response.map((pm) => ({
          paymentMethodId: pm.paymentMethodId,
          customerId: pm.customerId,
          type: pm.type,
          card: {
            last4: pm.card.last4,
            expMonth: pm.card.expMonth,
            expYear: pm.card.expYear,
            brand: pm.card.brand,
          },
        })),
    }),
    deleteUserPaymentMethod: builder.mutation<{ success: boolean }, { userId: string; paymentMethodId: string }>({
      query: ({ userId, paymentMethodId }) => ({
        url: `/users/delete/${userId}/payment-methods/${paymentMethodId}`,
        method: 'DELETE',
      }),
    }),
    updateUserPreferences: builder.mutation<Partial<User>, { userId: string; preferences: Preferences }>({
      query: ({ userId, preferences }) => ({
        url: `/users/update-preferences/${userId}`,
        method: 'PUT',
        body: preferences,
      }),
    }),
    updateUserDetails: builder.mutation<Partial<User>, { userId: string; user: Partial<User> }>({
      query: ({ userId, user }) => ({
        url: `/users/update/${userId}`,
        method: 'PUT',
        body: user,
      }),
    }),
  }),
  overrideExisting: false,
});

export const { useGetUserPaymentMethodsQuery, useDeleteUserPaymentMethodMutation, useUpdateUserPreferencesMutation, useUpdateUserDetailsMutation } = userApi;
