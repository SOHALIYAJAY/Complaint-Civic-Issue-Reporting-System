import Link from 'next/link'

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-muted/30">
      <h1 className="text-2xl font-semibold mb-2">Forgot password</h1>
      <p className="text-muted-foreground text-center max-w-md mb-6">
        Password reset is not enabled for this demo. Please sign in with Google, or contact support if you use email login.
      </p>
      <Link href="/login" className="text-primary underline">
        Back to sign in
      </Link>
    </div>
  )
}
