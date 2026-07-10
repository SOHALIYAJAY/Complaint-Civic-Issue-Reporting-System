"use client"

import { GoogleLogin } from "@react-oauth/google"
import { useRouter } from "next/navigation"
import axios from "axios"
import { getApiBaseUrl } from "../lib/config"
import { publicApi } from "../lib/authApi"

export default function GoogleLoginBtn() {
  const router = useRouter()

  const getRedirectPath = (user: any) => {
    const userRole = user.User_Role || user.role || 'Civic-User'
    
    switch (userRole) {
      case 'Department-User':
        return '/department'
      case 'Admin-User':
        return '/admin'
      case 'Officer':
        return '/officer'
      case 'Civic-User':
      default:
        return '/user-details' // First go to user details, then dashboard
    }
  }

  const handleSuccess = async (credentialResponse: any) => {
    const credential = credentialResponse?.credential
    if (!credential) {
      console.error("[GoogleLogin] Missing credential in credentialResponse:", credentialResponse)
      alert("Google sign-in did not return a credential. Please try again.")
      return
    }

    try {
      // Use public client so no stale Authorization header is sent with the ID token exchange
      const response = await publicApi.post("/api/google-login/", { token: credential })
      const data = response.data

      if (data.success) {
        const access = data.access_token ?? data.access
        const refresh = data.refresh_token ?? data.refresh
        if (!access || !refresh) {
          console.error("[GoogleLogin] Backend OK but missing tokens:", data)
          alert("Login response was incomplete. Please try again.")
          return
        }
        localStorage.setItem("access_token", access)
        localStorage.setItem("refresh_token", refresh)
        localStorage.setItem("user", JSON.stringify(data.user))

        const redirectPath = getRedirectPath(data.user)
        router.push(redirectPath)
      } else {
        console.error("Google login failed:", data)
        alert(data.message || "Login failed. Please try again.")
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("[GoogleLogin] Full error:", {
          message: error.message,
          code: error.code,
          baseURL: getApiBaseUrl(),
          url: error.config?.url,
          status: error.response?.status,
          data: error.response?.data,
        })
        const msg =
          (error.response?.data as { message?: string; details?: string })?.message ||
          (error.response?.data as { details?: string })?.details ||
          error.message
        alert(msg || "Could not reach the server. Check NEXT_PUBLIC_API_URL and CORS.")
      } else {
        console.error("[GoogleLogin] Unexpected error:", error)
        alert("Something went wrong during Google sign-in.")
      }
    }
  }

  const handleError = () => {
    console.error("[GoogleLogin] GoogleLogin onError (popup / FedCM)")
  }

  return (
    <div className="relative w-full max-w-[320px]">
      <div className="h-12 w-full rounded-md border border-gray-300 bg-white px-4 flex items-center justify-center gap-3 text-sm font-medium text-gray-700">
        <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
          <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 3l5.7-5.7C34.1 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z"/>
          <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15 19 12 24 12c3 0 5.7 1.1 7.8 3l5.7-5.7C34.1 6.1 29.3 4 24 4c-7.7 0-14.3 4.3-17.7 10.7z"/>
          <path fill="#4CAF50" d="M24 44c5.2 0 10-2 13.5-5.3l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.7-3.3-11.3-8l-6.5 5C9.5 39.5 16.2 44 24 44z"/>
          <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-1 2.7-2.9 4.9-5.5 6.5l6.2 5.2C39.3 36.7 44 31 44 24c0-1.3-.1-2.3-.4-3.5z"/>
        </svg>
        <span>Continue with Google</span>
      </div>

      <div className="absolute inset-0 opacity-0">
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={handleError}
          theme="outline"
          size="large"
          text="continue_with"
          shape="rectangular"
          width={320}
          useOneTap={false}
          auto_select={false}
          ux_mode="popup"
          use_fedcm_for_button={false}
          use_fedcm_for_prompt={false}
        />
      </div>
    </div>
  )
}
