import { baseApi } from '@/app/baseApi';


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
  }),
  overrideExisting: false,
});

export const { useGetUserPaymentMethodsQuery } = userApi;
