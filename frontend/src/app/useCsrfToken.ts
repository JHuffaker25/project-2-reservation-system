import { useEffect } from "react"

export function useCsrfToken() {
  useEffect(() => {
    async function fetchCsrf() {
      try {
        // Fetch CSRF endpoint to trigger the cookie being set by Spring Security
        // The CookieCsrfTokenRepository will automatically set the XSRF-TOKEN cookie
        await fetch(`${import.meta.env.VITE_API_BASE_URL}/users/csrf`, {
          credentials: "include" // Required to receive cookies
        })
        // No need to store in localStorage - the token is in the cookie
        // and will be read automatically by baseApi.ts
      } catch {
        // CSRF token fetch failed, but requests will still work if token is already in cookie
      }
    }
    fetchCsrf()
  }, [])
}
