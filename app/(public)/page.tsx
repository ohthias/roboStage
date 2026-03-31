"use client";
import Hero from "@/components/Hero";
import { Navbar } from "@/components/UI/Navbar";
import { Footer } from "@/components/UI/Footer";
import RevealOnScroll from "@/components/UI/RevealOnScroll";

import {
  Brain,
  FlaskConical,
  TrendingUp,
  ClipboardList,
  Target,
  BarChart3,
  Layers,
  Rocket,
  Activity,
  Clock,
  Eye,
  Lightbulb,
  Puzzle,
  Dumbbell,
  Bot,
  Globe,
  Pickaxe,
} from "lucide-react";
import { useRouter } from "next/navigation";
import MaintenancePage from "./MaintenancePage";

export default function Home() {
  const router = useRouter();
  return (
    <MaintenancePage />
  );
}
