import { baseApi } from '@/app/baseApi';
import type { Reservation } from '@/types/types';

export const reservationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getReservations: builder.query<Reservation[], void>({
      query: () => ({
        url: '/reservations/all',
        method: 'GET',
      }),
      transformResponse: (response: Reservation[]) => response,
    }),
    createReservation: builder.mutation<Reservation, Partial<Reservation>>({
        query: (newReservation) => ({
            url: '/reservations/new',
            method: 'POST',
            body: newReservation,
        }),
        transformResponse: (response: Reservation) => response,
    }),
  }),
  overrideExisting: false,
});

export const { useGetReservationsQuery, useCreateReservationMutation } = reservationApi;
