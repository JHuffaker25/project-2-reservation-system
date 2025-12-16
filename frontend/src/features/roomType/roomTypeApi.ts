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
        getRoomAvailability: builder.query<RoomType[], { id: string; checkIn: Date; checkOut: Date }>({
            query: ({ id, checkIn, checkOut }) => ({
                url: `/room-types/${id}/available?dates=${checkIn}&dates=${checkOut}`,
                method: 'GET',
            }),
            transformResponse: (response: RoomType[]) => {
                return response;
            },
            transformErrorResponse: (response: { status: number; data: { message: string } }) => {
                return response.data.message;
            }
        }),
    }),
    overrideExisting: false,
});

export const { useGetRoomTypesQuery, useGetRoomTypeByIdQuery } = roomTypeApi;