import { baseApi } from "@/app/baseApi";
import type { RoomType } from "@/types/types";

export const roomTypeApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getRoomTypes: builder.query<RoomType[], void>({
      query: () => ({
        url: '/room-types/all',
        method: 'GET',
      }),
      transformResponse: (response: RoomType[]) => {
        return response;
      }
    }),
    getRoomTypeById: builder.query<RoomType, string>({
      query: (id: string) => ({
        url: `/room-types/${id}`,
        method: 'GET',
      }),
      transformResponse: (response: RoomType) => {
        return response;
      }
    }),
    getRoomTypeByReservationId: builder.query<RoomType, string>({
      query: (id: string) => ({
        url: `/room-types/by-reservation/${id}`,
        method: 'GET',
      }),
      transformResponse: (response: RoomType) => {
        return response;
      }
    }),
    createRoomType: builder.mutation<RoomType, Partial<RoomType>>({
      query: (newRoomType) => ({
        url: `/room-types/create`,
        method: 'POST',
        body: newRoomType,
      }),
      transformResponse: (response: RoomType) => {
        return response;
      }
    }),
    deleteRoomType: builder.mutation<{ success: boolean; id: string }, string>({
      query: (id: string) => ({
        url: `/room-types/delete/${id}`,
        method: 'DELETE',
      }),
      transformResponse: (response: { success: boolean; id: string }) => {
        return response;
      }
    }),
    updateRoomType: builder.mutation<RoomType, Partial<RoomType> & { id: string }>({
      query: ({ id, ...updatedRoomType }) => ({
        url: `/room-types/update/${id}`,
        method: 'PUT',
        body: updatedRoomType,
      }),
      transformResponse: (response: RoomType) => {
        return response;
      }
    }),
  }),
  overrideExisting: false,
});

export const { useGetRoomTypesQuery, useGetRoomTypeByIdQuery, useGetRoomTypeByReservationIdQuery, useCreateRoomTypeMutation, useDeleteRoomTypeMutation, useUpdateRoomTypeMutation } = roomTypeApi;