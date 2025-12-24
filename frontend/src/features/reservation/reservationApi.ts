import { baseApi } from '@/app/baseApi';
import type { Reservation, UpdateReservationRequest } from '@/types/types';

export const reservationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getReservations: builder.query<Reservation[], void>({
      query: () => ({
        url: '/reservations/all',
        method: 'GET',
      }),
      transformResponse: (response: Reservation[]) => response,
    }),
    getUserReservations: builder.query<Reservation[], string>({
      query: (userid) => ({
        url: `/reservations/user/${userid}`,
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
    updateReservation: builder.mutation<UpdateReservationRequest, UpdateReservationRequest>({
        query: (updatedReservation) => ({
            url: `/reservations/${updatedReservation.id}/update`,
            method: 'PUT',
            body: updatedReservation,
        }),
        transformResponse: (response: UpdateReservationRequest) => response,
    }),
    cancelReservation: builder.mutation<{ message: string }, string>({
      query: (reservationId) => ({
        url: `/reservations/delete/${reservationId}`,
        method: 'DELETE',
      }),
      transformResponse: (response: { message: string }) => response,
    }),
    getReservationTransaction: builder.query<any, string>({
      query: (reservationId) => ({
        url: `/transactions/reservation/${reservationId}`,
        method: 'GET',
      }),
      transformResponse: (response: any) => response,
    }),
  }),
  overrideExisting: false,
});

export const { useGetReservationsQuery, useGetUserReservationsQuery, useCreateReservationMutation, useUpdateReservationMutation, useCancelReservationMutation, useGetReservationTransactionQuery } = reservationApi;
