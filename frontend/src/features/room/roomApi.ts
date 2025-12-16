import { baseApi } from "@/app/baseApi";
import type { Room } from "@/types/types";

export const roomApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getAvailableRooms: builder.query<Room[], { id: string; checkIn: string; checkOut: string }>({
            query: ({ id, checkIn, checkOut }) => ({
                url: `/rooms/${id}/available?dates=${checkIn}&dates=${checkOut}`,
                method: 'GET',
            }),
            transformResponse: (response: Room[]) => {
                return response;
            },
            transformErrorResponse: (response: { status: number; data: { message: string } }) => {
                return response.data.message;
            }
        }),
    }),
    overrideExisting: false,
});

export const { useGetAvailableRoomsQuery } = roomApi;