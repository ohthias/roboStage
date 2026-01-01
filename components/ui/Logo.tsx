'use client';
import { useRouter } from "next/navigation"

type LogoSize = "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl";

export default function Logo({ logoSize, redirectIndex }: { logoSize: LogoSize, redirectIndex?: boolean }) {
    const router = useRouter();
    return (
        <label
            onClick={() => {
                if (redirectIndex) {
                    router.push("/");
                }
            }}
            className={`text-${logoSize} font-black uppercase italic tracking-tight transition-opacity duration-300 ${redirectIndex ? "cursor-pointer opacity-80 hover:opacity-100" : ""}`}
            aria-label="Página inicial RoboStage"
        >
            Robo<span className="text-primary">Stage</span>
        </label>
    )
}