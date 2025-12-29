import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { RoomType } from "@/types/types";

const roomTypeSlice = createSlice({
    name: "roomTypes",
    initialState: {
        all: [] as RoomType[],
        current: null as RoomType | null,
        error: null as string | null,
    },
    reducers: {
        setRoomTypes(state, action: PayloadAction<RoomType[]>) {
            state.all = action.payload;
            state.error = null;
        },
        getRoomTypesSuccess(state, action: PayloadAction<RoomType[]>) {
            state.all = action.payload;
            state.error = null;
        },
        getRoomTypesFailure(state) {
            state.all = [];
            state.error = "Failed to fetch room types.";
        },
        setRoomType(state, action: PayloadAction<RoomType>) {
            state.current= action.payload;
            state.error = null;
        },
    },
});

export const { setRoomTypes, getRoomTypesSuccess, getRoomTypesFailure, setRoomType } = roomTypeSlice.actions;

export default roomTypeSlice.reducer;