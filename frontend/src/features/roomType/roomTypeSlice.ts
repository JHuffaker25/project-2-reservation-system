import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface RoomType {
    id: string;
    name: string;
    description: string;
    pricePerNight: number;
    maxGuests: number;
    amenities: string[];
    squareFootage: number;
    images: string[];
}

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