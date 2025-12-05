import { useEffect } from "react"
import { useSelector } from "react-redux"
import type { RootState } from "@/app/store"

export function ThemeEffect() {
  const theme = useSelector((state: RootState) => state.theme.theme)

  useEffect(() => {
    const root = window.document.documentElement

    root.classList.remove("light", "dark")

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
      root.classList.add(systemTheme)
    } else {
      root.classList.add(theme)
    }
  }, [theme])

  return null
}
