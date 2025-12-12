import { baseApi } from "@/app/baseApi";
import type { RoomType } from "@/features/rooms/roomSlice";

export const roomApi = baseApi.injectEndpoints({
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
    }),
    overrideExisting: false,
});

export const { useGetRoomTypesQuery, useGetRoomTypeByIdQuery } = roomApi;