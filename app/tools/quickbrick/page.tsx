import { Navbar } from "@/components/Navbar";
import QuickBrickCanvas from "@/components/QuickBrickCanva";

export function QuickBrickPage() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <Navbar />
      <h1 className="text-2xl font-bold mb-4">Quick Brick Page</h1>
      <QuickBrickCanvas />
    </div>
  );
}