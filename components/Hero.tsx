"use client";
import { useEffect, useRef, useState } from "react";
import FundoPadrao from "@/public/images/fundoPadrao.gif";

export function Hero() {
  const [showVideo, setShowVideo] = useState(false);
  const playerRef = useRef<any>(null);

  // --- YOUTUBE PLAYER ---
  useEffect(() => {
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.body.appendChild(tag);

    (window as any).onYouTubeIframeAPIReady = () => {
      playerRef.current = new (window as any).YT.Player("hero-video", {
        videoId: "exWkcUBS0j8",
        playerVars: {
          autoplay: 0,
          controls: 0,
          modestbranding: 0,
          rel: 0,
          mute: 1,
          showinfo: 0,
          loop: 0,
          playsinline: 1,
        },
        events: {
          onReady: () => {
            setTimeout(() => {
              setShowVideo(true);
              playerRef.current.playVideo();
            }, 10000);
          },
          onStateChange: (event: any) => {
            const YT = (window as any).YT;
            if (event.data === YT.PlayerState.ENDED) {
              setShowVideo(false);
              setTimeout(() => {
                if (playerRef.current) {
                  playerRef.current.seekTo(0);
                  setShowVideo(true);
                  playerRef.current.playVideo();
                }
              }, 10000);
            }
          },
        },
      });
    };

    return () => {
      document.body.removeChild(tag);
    };
  }, []);

  return (
    <div className="hero h-64 sm:h-80 lg:h-[calc(100vh-64px)] relative overflow-hidden">
      {/* Fundo GIF */}
      <div
        className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${showVideo ? "opacity-0" : "opacity-100"
          }`}
      >
        <img
          src={FundoPadrao.src}
          alt="Fundo animado"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Fundo vídeo */}
      <div
        className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${showVideo ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
      >
        <div className="absolute top-1/2 left-1/2 w-[120vw] h-[120vh] -translate-x-1/2 -translate-y-1/2 overflow-hidden">
          <div id="hero-video" className="w-full h-full scale-150"></div>
        </div>
      </div>

      <div className="absolute inset-0 bg-black/50 z-10"></div>

      {/* Conteúdo */}
      <div className="hero-content text-neutral-content relative z-20 flex flex-col lg:flex-row lg:items-center lg:space-x-6 space-y-6 lg:space-y-0">
        <div className="max-w-md text-center lg:text-left space-y-4">
          <h1 className="text-5xl font-black uppercase italic tracking-tight">
            Robo<strong className="text-primary">Stage</strong>
          </h1>

          <span className="text-sm md:text-md text-white">
            O palco é seu. A estratégia também!{" "}
            <span className="text-rotate">
              <span>
                <span className="bg-teal-400 text-teal-800 px-2 rounded-sm">Planeje!</span>
                <span className="bg-red-400 text-red-800 px-2 rounded-sm">Teste!</span>
                <span className="bg-blue-400 text-blue-800 px-2 rounded-sm">Organize!</span>
                <span className="bg-yellow-400 text-yellow-800 px-2 rounded-sm">Evolua!</span>
              </span>
            </span>
          </span>
        </div>

        <div className="hidden lg:block w-px h-40 bg-white/50"></div>

        <div className="max-w-50 lg:max-w-xs hidden lg:block">
          <img
            src="https://www.cvrobotics.org/wp-content/uploads/2016/05/FIRSTLego_iconHorz_RGB_reverse.png"
            className="w-full h-auto"
            alt="FLL Logo"
          />
        </div>
      </div>
    </div>
  );
}