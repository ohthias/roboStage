import { BackgroundStars } from '@/components/UI/BackgroundStars'
import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-base-200 p-4">
        <BackgroundStars />
        <SignUp path="/sign-up" routing="path" signInUrl="/sign-in" />
    </div>
  )
}