"use client";
import {
  Trophy,
  Cpu,
  Users,
  Zap,
  BarChart3,
  MessageSquare,
  Construction,
} from "lucide-react";
import { Footer } from "../UI/Footer";
import Hero from "../Hero";
import Logo from "../UI/Logo";
import NoiseImage from "../UI/NoiseImage";

export default function FLLHome() {
  return (
    <div className="min-h-screen bg-base-200 text-base-content">
      <div className="mt-24" />
      <main className="max-w-6xl mx-auto px-4 pb-16">
        <Hero />
      </main>
      <Footer />
    </div>
  );
}
