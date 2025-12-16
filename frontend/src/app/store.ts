import { configureStore } from '@reduxjs/toolkit'
import themeReducer from '@/features/theme/themeSlice'
import authReducer from '@/features/auth/authSlice'
import roomTypeReducer from '@/features/roomType/roomTypeSlice'
import reservationReducer from '@/features/reservation/reservationSlice'
import { baseApi } from './baseApi'
import { authApi } from '@/features/auth/authApi'

export const store = configureStore({
    reducer: {
        theme: themeReducer,
        auth: authReducer,
        roomTypes: roomTypeReducer,
        reservations: reservationReducer,
        [baseApi.reducerPath]: baseApi.reducer,
        [authApi.reducerPath]: authApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(baseApi.middleware),
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch