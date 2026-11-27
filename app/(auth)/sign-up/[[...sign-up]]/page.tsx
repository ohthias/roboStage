import { BackgroundStars } from "@/components/stage/decor/BackgroundStars";
import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-base-200 p-4">
      <BackgroundStars />
      <div className="relative z-10">
        <SignUp signInUrl="/sign-in" fallbackRedirectUrl="/dashboard" />
      </div>
    </div>
  );
}