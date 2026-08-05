'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Maximize, MoreVertical, Pause, RotateCcw, Type } from 'lucide-react';
import { THEMES } from '../themes';

const TOTAL_SECONDS = 2 * 60 + 30; // 2min30sQ
const DEFAULT_WORD = 'LEGO!';
const RADIUS = 120;

type Status = 'idle' | 'intro' | 'running' | 'paused' | 'finished';
type ThemeKey = keyof typeof THEMES;

function formatTime(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, '0');
  const s = (totalSeconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export default function RobotGame() {
  const [status, setStatus] = useState<Status>('idle');
  const [timeLeft, setTimeLeft] = useState(TOTAL_SECONDS);
  const [word, setWord] = useState(DEFAULT_WORD);
  const [wordInput, setWordInput] = useState(DEFAULT_WORD);
  const [introStep, setIntroStep] = useState('3');
  const [themeKey, setThemeKey] = useState<ThemeKey>('bioglow');

  const containerRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDialogElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const introTimeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearAllTimers = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    introTimeoutsRef.current.forEach(clearTimeout);
    introTimeoutsRef.current = [];
    intervalRef.current = null;
  }, []);

  const startMainTimer = useCallback(() => {
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          setStatus('finished');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const startIntro = useCallback(() => {
    setStatus('intro');
    setIntroStep('3');
    const sequence = ['3', '2', '1', word];

    sequence.forEach((step, i) => {
      const t = setTimeout(() => {
        setIntroStep(step);
        if (i === sequence.length - 1) {
          const t2 = setTimeout(() => {
            setStatus('running');
            startMainTimer();
          }, 800);
          introTimeoutsRef.current.push(t2);
        }
      }, i * 800);
      introTimeoutsRef.current.push(t);
    });
  }, [word, startMainTimer]);

  const handleScreenClick = () => {
    if (status === 'idle' || status === 'finished') {
      clearAllTimers();
      setTimeLeft(TOTAL_SECONDS);
      startIntro();
    } else if (status === 'running') {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setStatus('paused');
    } else if (status === 'paused') {
      setStatus('running');
      startMainTimer();
    }
    // durante 'intro' o clique é ignorado
  };

  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation();
    clearAllTimers();
    setStatus('idle');
    setTimeLeft(TOTAL_SECONDS);
  };

  const handleFullscreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const openWordModal = (e: React.MouseEvent) => {
    e.stopPropagation();
    setWordInput(word);
    modalRef.current?.showModal();
  };

  const saveWord = (e: React.MouseEvent) => {
    e.stopPropagation();
    const trimmed = wordInput.trim();
    if (trimmed) setWord(trimmed.toUpperCase());
  };

  useEffect(() => () => clearAllTimers(), [clearAllTimers]);

  const elapsed = TOTAL_SECONDS - timeLeft;
  const progressRatio = status === 'idle' ? 0 : elapsed / TOTAL_SECONDS;
  const theme = THEMES[themeKey];

  return (
    <div
      ref={containerRef}
      onClick={handleScreenClick}
      className="relative flex h-screen w-full select-none flex-col items-center justify-center overflow-hidden cursor-pointer"
      style={{
        color: theme.textColor,
        backgroundImage: `linear-gradient(rgba(11, 12, 16, 0.72), rgba(11, 12, 16, 0.72)), url(${theme.backgroundURL})`,
        backgroundPosition: 'center',
        backgroundSize: 'cover',
      }}
    >
      {/* Menu superior direito */}
      <div
        className="dropdown dropdown-end absolute right-4 top-4 z-50"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          tabIndex={0}
          role="button"
          className="btn btn-circle btn-ghost text-[#F4F1EA] hover:bg-white/10"
        >
          <MoreVertical className="h-6 w-6" />
        </div>
        <ul
          tabIndex={0}
          className="menu dropdown-content z-[1] mt-2 w-56 rounded-box bg-base-100 p-2 text-base-content shadow-xl"
        >
          <li>
            <details>
              <summary className="px-2 text-xs uppercase tracking-widest opacity-60">
                Tema
              </summary>
              <ul className="mt-2">
                {Object.entries(THEMES).map(([key, value]) => (
                  <li key={key}>
                    <a
                      onClick={(e) => {
                        e.stopPropagation();
                        setThemeKey(key as ThemeKey);
                      }}
                      className={themeKey === key ? 'bg-base-300' : 'hover:bg-base-200'}
                    >
                      {value.name}
                    </a>
                  </li>
                ))}
              </ul>
            </details>
          </li>
          <li>
            <a onClick={handleFullscreen} className="hover:bg-base-200">
              <Maximize className="h-4 w-4" /> Tela cheia
            </a>
          </li>
          <li>
            <a onClick={handleReset} className="hover:bg-base-200">
              <RotateCcw className="h-4 w-4" /> Resetar
            </a>
          </li>
          <li>
            <a onClick={openWordModal} className="hover:bg-base-200">
              <Type className="h-4 w-4" /> Escolher palavra
            </a>
          </li>
        </ul>
      </div>

      <div className="relative flex items-center justify-center">
        <div className="absolute flex flex-col items-center gap-3">
          {status === 'idle' && (
            <>
              <span className="font-mono text-6xl font-bold tabular-nums text-[#F4F1EA]/80">
                {formatTime(TOTAL_SECONDS)}
              </span>
              <p className="text-sm uppercase tracking-widest text-[#F4F1EA]/50">
                toque para iniciar
              </p>
            </>
          )}

          {status === 'intro' && (
            <span
              key={introStep}
              className="animate-[pulse_0.8s_ease-in-out] text-9xl font-black tracking-tight text-[#F5B942]"
            >
              {introStep}
            </span>
          )}

          {(status === 'running' || status === 'paused') && (
            <>
              <span className="font-mono text-9xl font-bold tabular-nums">
                {formatTime(timeLeft)}
              </span>
              {status === 'paused' && (
                <span className="flex items-center gap-1 text-xs uppercase tracking-widest text-[#F5B942]">
                  <Pause className="h-3 w-3" /> pausado
                </span>
              )}
            </>
          )}

          {status === 'finished' && (
            <>
              <span className="text-2xl font-black uppercase tracking-tight text-[#F5B942]">
                tempo!
              </span>
              <p className="text-xs uppercase tracking-widest text-[#F4F1EA]/50">
                toque para reiniciar
              </p>
            </>
          )}
        </div>
      </div>

      {/* Modal escolher palavra */}
      <dialog ref={modalRef} className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-box bg-base-100 text-base-content">
          <h3 className="mb-4 text-lg font-bold">Escolher palavra</h3>
          <input
            type="text"
            value={wordInput}
            onChange={(e) => setWordInput(e.target.value)}
            placeholder="Digite a palavra"
            maxLength={20}
            className="input input-bordered w-full bg-base-200"
          />
          <div className="modal-action">
            <form method="dialog" className="flex gap-2">
              <button className="btn btn-ghost">Cancelar</button>
              <button
                onClick={saveWord}
                className="btn border-none bg-[#F5B942] text-[#0B0C10] hover:bg-[#F5B942]/90"
              >
                Salvar
              </button>
            </form>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>fechar</button>
        </form>
      </dialog>
    </div>
  );
}