const initLoginRoute = (provider: string) => `/auth/user/${provider}`

/**
 * Constructs a complete URL for Medusa backend API endpoints.
 * 
 * @param path - The API endpoint path (e.g., "/auth/user/keycloak")
 * @param params - Optional query parameters to append to the URL
 * @returns A complete URL object with backend base URL, path, and query parameters
 * 
 * @example
 * ```typescript
 * const url = getMedusaUrl("/auth/user/keycloak");
 * getMedusaUrl("/auth/callback", { code: "abc123" });
 * ```
 */
const getMedusaUrl = (path: string, params?: Record<string, string>): URL => {
  // IMPORTANT: __BACKEND_URL__ is a global variable that points to the backend URL
  // Remember to set MEDUSA_BACKEND_URL in your .env file otherwise, by default, it will be "/"
  // and will produce an error
  // @ts-expect-error - __BACKEND_URL__ is a global variable defined at build time
  const url = new URL(path, __BACKEND_URL__)
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value)
    }
  }
  return url
}

/**
 * Initiates the authentication flow for a specific provider.
 * 
 * @param provider - The authentication provider name (e.g., "keycloak", "google")
 * @param callbackUrl - The URL where the user will be redirected after authentication
 * @returns The authentication URL where the user should be redirected
 * 
 * @example
 * ```typescript
 * await medusaAuthProviderLogin("keycloak", "https://app.com/callback");
 * ```
 */
export const medusaAuthProviderLogin = async (provider: string, callbackUrl: string): Promise<string> => {
  const initLoginUrl = getMedusaUrl(initLoginRoute(provider))
  const response = await fetch(initLoginUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      callback_url: callbackUrl
    })
  })
  if (!response.ok) {
    throw new Error("Received non-200 status code")
  }
  const data = await response.json()
  if (!data.location) {
    throw new Error("No location received")
  }
  return data.location
}

const callbackRoute = (provider: string) => `/auth/user/${provider}/callback`;

/**
 * Handles the callback from the authentication provider.
 * 
 * @param provider - The authentication provider name (e.g., "keycloak", "google")
 * @param params - Query parameters returned by the authentication provider
 * @returns The authentication token for the authenticated user
 * 
 * @example
 * ```typescript
 * await medusaAuthProviderCallback("keycloak", { code: "abc123", state: "xyz" });
 * ```
 */
export const medusaAuthProviderCallback = async (provider: string, params: Record<string, string>): Promise<string> => {
  const callbackUrl = getMedusaUrl(callbackRoute(provider), params)
  const response = await fetch(callbackUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  })
  if (!response.ok) {
    throw new Error("Received non-200 status code")
  }
  const data = await response.json()
  if (!data.token) {
    throw new Error("No token received")
  }
  return data.token
}