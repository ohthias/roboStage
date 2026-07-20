import { BackgroundStars } from "@/components/UI/BackgroundStars";
import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-base-200 p-4">
      <BackgroundStars />
      <SignIn />
    </div>
  );
}
