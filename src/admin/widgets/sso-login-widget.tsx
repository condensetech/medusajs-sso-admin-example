import { useState } from "react"
import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Button } from "@medusajs/ui"
import { useNavigate, useSearchParams } from "react-router-dom"
import { medusaAuthProviderLogin } from "../lib/auth-provider-login"

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

  // TODO: Callback Logic

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