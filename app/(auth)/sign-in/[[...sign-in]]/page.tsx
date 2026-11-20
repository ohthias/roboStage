import { BackgroundStars } from "@/components/UI/BackgroundStars";
import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-base-200 p-4">
      <BackgroundStars />
      <div className="relative z-10">
        <SignIn signUpUrl="/sign-up" fallbackRedirectUrl="/dashboard" />
      </div>
    </div>
  );
}