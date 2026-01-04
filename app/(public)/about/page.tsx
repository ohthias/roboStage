import ComingSoon from "@/components/ComingSoon";
import { Navbar } from "@/components/UI/Navbar";
import { Footer } from "@/components/UI/Footer";

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="flex min-h-screen flex-col items-center justify-center px-4 py-16">
        <ComingSoon />
      </main>
      <Footer />
    </>
  );
}
