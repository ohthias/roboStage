"use client";

import { usePathname, useSearchParams } from "next/navigation";
import Navbar from "@/components/navbar";

export default function Hero() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const pathParts = pathname.split("/").filter(Boolean);
  const id = pathParts[0] || undefined;
  const mode = pathParts[1] || "default";
  const admin = searchParams.get("admin") || undefined;

  return <Navbar mode={mode} id={id} admin={admin} />;
}
