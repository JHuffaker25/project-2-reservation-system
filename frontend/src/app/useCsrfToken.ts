import { useEffect } from "react"

export function useCsrfToken() {
  useEffect(() => {
    async function fetchCsrf() {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/users/csrf`, {
          credentials: "include"
        })
        if (res.ok) {
          const data = await res.json()
          if (data.token) {
            localStorage.setItem("csrfToken", data.token)
          }
        }
      } catch {
        // Optionally handle error
      }
    }
    fetchCsrf()
  }, [])
}
