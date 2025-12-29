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
        getAllRooms: builder.query<Room[], void>({
            query: () => ({
                url: `/rooms/all`,
                method: 'GET',
            }),
            transformResponse: (response: Room[]) => {
                return response;
            },
            transformErrorResponse: (response: { status: number; data: { message: string } }) => {
                return response.data.message;
            }
        }),
        createRoom: builder.mutation<Room, Partial<Room>>({
            query: (newRoom) => ({
                url: `/rooms/new`,
                method: 'POST',
                body: newRoom,
            }),
            transformResponse: (response: Room) => {
                return response;
            },
            transformErrorResponse: (response: { status: number; data: { message: string } }) => {
                return response.data.message;
            }
        }),
        updateRoom: builder.mutation<Room, Partial<Room> & { id: string }>({
            query: ({ id, ...updatedRoom }) => ({
                url: `/rooms/update/${id}`,
                method: 'PUT',
                body: updatedRoom,
            }),
            transformResponse: (response: Room) => {
                return response;
            },
            transformErrorResponse: (response: { status: number; data: { message: string } }) => {
                return response.data.message;
            }
        }),
        deleteRoom: builder.mutation<{ success: boolean; id: string }, string>({
            query: (id) => ({
                url: `/rooms/delete/${id}`,
                method: 'DELETE',
            }),
            transformResponse: (response: { success: boolean; id: string }) => {
                return response;
            },
            transformErrorResponse: (response: { status: number; data: { message: string } }) => {
                return response.data.message;
            }
        }),
    }),
    overrideExisting: false,
});

export const { useGetAvailableRoomsQuery, useGetAllRoomsQuery, useCreateRoomMutation, useUpdateRoomMutation, useDeleteRoomMutation } = roomApi;