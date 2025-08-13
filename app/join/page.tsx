import { Navbar } from "@/components/Navbar";
import AuthForm from "@/components/AuthForm";
import { Footer } from "@/components/ui/Footer";

export default function LoginPage() {
  return (
    <div className="flex flex-col justify-between">
      <Navbar />
      <AuthForm />
      <Footer />
    </div>
  );
}
