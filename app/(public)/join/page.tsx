import { Navbar } from "@/components/Navbar";
import AuthForm from "@/components/AuthForm";
import { Footer } from "@/components/ui/Footer";

export default function LoginPage() {
  return (
    <div className="flex flex-col justify-between min-h-screen">
      <Navbar />
      <div className="min-h-[calc(100vh-2rem)] flex items-center justify-center">
        <AuthForm />
      </div>
      <Footer />
    </div>
  );
}
