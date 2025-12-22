import { baseApi } from "@/app/baseApi";
import type { RoomType } from "@/features/roomType/roomTypeSlice";

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
  }),
  overrideExisting: false,
});

export const { useGetRoomTypesQuery, useGetRoomTypeByIdQuery, useGetRoomTypeByReservationIdQuery } = roomTypeApi;