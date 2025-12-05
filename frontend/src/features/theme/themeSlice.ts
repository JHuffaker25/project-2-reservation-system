import { createSlice } from "@reduxjs/toolkit"
import type { PayloadAction } from "@reduxjs/toolkit"

export type Theme = "dark" | "light" | "system"

export interface ThemeState {
  theme: Theme
}

const storageKey = "vite-ui-theme"

const initialState: ThemeState = {
  theme: (localStorage.getItem(storageKey) as Theme) || "light",
}

export const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<Theme>) => {
      state.theme = action.payload
      localStorage.setItem(storageKey, action.payload)
    },
  },
})

export const { setTheme } = themeSlice.actions
export default themeSlice.reducer
