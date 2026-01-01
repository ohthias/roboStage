'use client';
import React, { useEffect, useRef, useState } from "react";
import { ArrowRight, ChevronDown, Rocket } from "lucide-react";
import Logo from "./ui/Logo";

const Reveal: React.FC<{ children: React.ReactNode, delay?: string }> = ({ children, delay = '0s' }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal ${isVisible ? 'active' : ''}`}
      style={{ transitionDelay: delay }}
    >
      {children}
    </div>
  );
}

export default function Hero() {
  return (
    <section className="hero h-screen relative bg-dot-pattern overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-base-100/50 to-base-300"></div>

      <div className="hero-content relative z-10 text-center px-6 pt-28">
        <div className="max-w-5xl space-y-10">
          <div className="flex justify-center">
            <span className="badge badge-outline badge-sm font-semibold tracking-widest uppercase">
              Onde estratégias ganham vida
            </span>
          </div>

          <Logo logoSize="6xl" redirectIndex={false} />

          <p className="text-base md:text-xl text-base-content/60 max-w-xl mx-auto font-medium leading-relaxed mt-2">
            Estratégia, dados e testes reunidos em uma única plataforma para equipes de
            robótica.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-5 pt-4">
            <button className="btn btn-primary btn-md px-14 rounded-2xl font-black uppercase tracking-widest bg-robo-red border-none shadow-xl hover:scale-105 transition-transform"
              onClick={() => {
                window.location.href = '/auth/signin';
              }}
            >
              Começar agora
            </button>
            <button className="btn btn-default btn-outline btn-md px-14 rounded-2xl font-black uppercase tracking-widest shadow-xl hover:scale-105 transition-transform"
              onClick={() => {
                window.location.href = '/about';
              }}
            >
              Saiba mais <ArrowRight className="ml-2" />
            </button>
          </div>
        </div>
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 opacity-20">
        <ChevronDown size={28} />
      </div>
    </section>

  );
}