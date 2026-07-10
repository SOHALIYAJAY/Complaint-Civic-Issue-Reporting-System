"use client"

import { GoogleOAuthProvider } from "@react-oauth/google"
import { getGoogleWebClientId } from "@/lib/googleClientId"

export function Providers({ children }: { children: React.ReactNode }) {
  const clientId = getGoogleWebClientId()
  return (
    <GoogleOAuthProvider clientId={clientId}>
      {children}
    </GoogleOAuthProvider>
  )
}
