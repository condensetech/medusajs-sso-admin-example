import { useState } from "react"
import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Button } from "@medusajs/ui"
import { useNavigate, useSearchParams } from "react-router-dom"
import { medusaAuthProviderLogin } from "../lib/auth-provider-login"
import { useEffect } from "react"
import { medusaAuthProviderCallback } from "../lib/auth-provider-login"
import { jwtDecode } from "jwt-decode"
import { medusaTokenRefresh, medusaInitSession, medusaUserRegister } from "../lib/auth-provider-login"

const providers = [
  {
    provider: "google",
    providerName: "Google",
  },
]

const formatError = (error: unknown) => {
  if (error instanceof Error) {
    return error.message
  }
  return "Unknown error"
}

const SsoLoginWidget = () => {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  // we'll need these later
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const currentProvider = searchParams.get("provider")

  const handleLogin = async (provider: string) => {
    setIsLoading(true)
    try {
      const callbackUrl = `${window.location.origin}/app/login?provider=${provider}`
      const location = await medusaAuthProviderLogin(provider, callbackUrl)
      window.location.href = location
    } catch (error) {
      console.error(error)
      setError(`Failed to initiate login: ${formatError(error)}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLoginCallback = async (provider: string, params: Record<string, string>) => {
    setIsLoading(true)
    try {
      let token = await medusaAuthProviderCallback(provider, params)
      const decodedToken = jwtDecode(token) as { actor_id: string }
      if (decodedToken.actor_id === "") {
        await medusaUserRegister(provider, token)
        token = await medusaTokenRefresh(token)
      }
      await medusaInitSession(token)
      const from = (location as any).state?.from?.pathname || "/orders"
      navigate(from, { replace: true })
    } catch (error) {
      console.error(error)
      setError(`Failed to complete Keycloak login: ${formatError(error)}`)
    } finally {
      setIsLoading(false)
    }
  }
  
  useEffect(() => {
    if (currentProvider) {
      const params = Object.fromEntries(
        Array.from(searchParams.entries()).filter(([key]) => key !== "provider") as [string, string][]
      )
      handleLoginCallback(currentProvider, params)
    }
  }, [currentProvider])

  return (
    <div className="justify-between py-2">
      {providers.map((provider) => (
        <Button key={provider.provider} variant="secondary" size="large" className="w-full"
          onClick={() => handleLogin(provider.provider)}
          disabled={isLoading}
        >
          {provider.providerName}
        </Button>
      ))}
      {error && <p className="text-red-500">{error}</p>}
    </div>
  )
}

export const config = defineWidgetConfig({
  zone: "login.after",
})

export default SsoLoginWidget