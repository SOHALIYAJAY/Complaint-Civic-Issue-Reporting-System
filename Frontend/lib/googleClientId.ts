/**
 * Single Web OAuth client ID (must match Django GOOGLE_CLIENT_ID and Google Cloud Console).
 */
export const GOOGLE_WEB_CLIENT_ID =
  '368010718950-hcafld60i8i3n95tf8o59h3cvfn525sq.apps.googleusercontent.com'

/** Prefer NEXT_PUBLIC_GOOGLE_CLIENT_ID; same value as backend GOOGLE_CLIENT_ID. */
export function getGoogleWebClientId(): string {
  const fromEnv =
    typeof process !== 'undefined'
      ? process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim()
      : undefined
  return fromEnv || GOOGLE_WEB_CLIENT_ID
}
