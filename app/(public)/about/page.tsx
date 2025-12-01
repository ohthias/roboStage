import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/ui/Footer";

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="flex min-h-screen flex-col items-center justify-center px-4 py-16">
        <h1 className="mb-8 text-4xl font-bold">About RoboStage</h1>
        <p></p>
      </main>
      <Footer />
    </>
  );
}
