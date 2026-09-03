"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Activity, Zap } from "lucide-react";

const chartPath =
  "M0 130 C45 120 65 105 100 112 C140 120 160 70 205 82 C245 94 270 50 310 61 C350 72 375 25 415 42 C450 55 470 28 500 20";

const metrics = [
  { label: "Consistência", value: "94.2%", change: "+4.8%" },
  { label: "Precisão", value: "91.8%", change: "+3.2%" },
  { label: "Melhor run", value: "18.4s", change: "-1.6s" },
];

const ease = [0.22, 1, 0.36, 1] as const;

export default function LabTestHeroPreview() {
  const reduceMotion = useReducedMotion();

  const reveal = (delay = 0) => ({
    initial: {
      opacity: 0,
      y: reduceMotion ? 0 : 18,
    },
    animate: {
      opacity: 1,
      y: 0,
    },
    transition: {
      delay,
      duration: 0.65,
      ease,
    },
  });

  return (
    <motion.div
      className="relative"
      initial={{
        opacity: 0,
        y: reduceMotion ? 0 : 30,
        scale: reduceMotion ? 1 : 0.97,
      }}
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
      }}
      transition={{
        duration: 0.9,
        ease: "easeInOut",
      }}
    >
      {/* Glow externo */}
      <motion.div
        className="absolute -inset-8 rounded-[4rem] bg-primary/10 blur-3xl"
        animate={
          reduceMotion
            ? undefined
            : {
                opacity: [0.35, 0.75, 0.35],
                scale: [0.96, 1.04, 0.96],
              }
        }
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Segundo glow menor */}
      {!reduceMotion && (
        <motion.div
          className="absolute -right-10 top-1/4 h-32 w-32 rounded-full bg-primary/10 blur-3xl"
          animate={{
            x: [0, -18, 0],
            y: [0, 12, 0],
            opacity: [0.2, 0.45, 0.2],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      )}

      {/* Dashboard */}
      <motion.div
        className="relative rounded-tl-[42px] rounded-br-[42px] rounded-tr-3xl rounded-bl-3xl border border-base-content/10 bg-base-200/70 p-3 shadow-2xl backdrop-blur"
        whileHover={
          reduceMotion
            ? undefined
            : {
                y: -4,
                rotateX: 1,
                rotateY: -1,
                transition: { duration: 0.35 },
              }
        }
      >
        <div className="relative overflow-hidden rounded-tl-[34px] rounded-br-[34px] rounded-tr-2xl rounded-bl-2xl border border-base-content/10 bg-base-100">
          {/* Scanline */}
          {!reduceMotion && (
            <motion.div
              className="pointer-events-none absolute inset-y-0 left-0 z-10 w-px bg-primary/30 shadow-[0_0_20px_4px] shadow-primary/20"
              initial={{ x: "-20px", opacity: 0 }}
              animate={{
                x: ["0%", "1000%"],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                repeatDelay: 5,
                ease: "easeInOut",
              }}
            />
          )}

          {/* Topbar */}
          <motion.div
            className="flex items-center justify-between border-b border-base-content/10 px-5 py-4"
            {...reveal(0.1)}
          >
            <div className="flex items-center gap-2">
              <motion.div
                className="h-2.5 w-2.5 rounded-full bg-error/60"
                animate={
                  reduceMotion
                    ? undefined
                    : { opacity: [0.5, 0.9, 0.5] }
                }
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />

              <motion.div
                className="h-2.5 w-2.5 rounded-full bg-warning/60"
                animate={
                  reduceMotion
                    ? undefined
                    : { opacity: [0.5, 1, 0.5] }
                }
                transition={{
                  duration: 1.6,
                  repeat: Infinity,
                  delay: 0.3,
                  ease: "easeInOut",
                }}
              />

              <motion.div
                className="h-2.5 w-2.5 rounded-full bg-success/60"
                animate={
                  reduceMotion
                    ? undefined
                    : {
                        scale: [1, 1.35, 1],
                        opacity: [0.6, 1, 0.6],
                      }
                }
                transition={{
                  duration: 1.8,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </div>

            <motion.span
              className="text-xs font-medium text-base-content/40"
              animate={
                reduceMotion
                  ? undefined
                  : { opacity: [0.4, 0.7, 0.4] }
              }
              transition={{
                duration: 3,
                repeat: Infinity,
              }}
            >
              LabTest / CalibraBot
            </motion.span>

            <div className="flex items-center gap-1.5">
              <Activity size={13} className="text-success" />

              <motion.span
                className="text-[10px] font-semibold uppercase tracking-wider text-success"
                animate={
                  reduceMotion
                    ? undefined
                    : { opacity: [0.5, 1, 0.5] }
                }
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                }}
              >
                Live
              </motion.span>
            </div>
          </motion.div>

          <div className="space-y-5 p-5">
            {/* Heading */}
            <motion.div
              className="flex items-center justify-between"
              {...reveal(0.2)}
            >
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-base-content/40">
                  Teste de motores
                </p>

                <motion.h3
                  className="mt-1 text-lg font-bold"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    delay: 0.3,
                    duration: 0.5,
                    ease: "easeInOut"
                  }}
                >
                  Performance
                </motion.h3>
              </div>

              <motion.div
                className="badge badge-primary badge-outline"
                animate={
                  reduceMotion
                    ? undefined
                    : {
                        scale: [1, 1.04, 1],
                        boxShadow: [
                          "0 0 0px rgba(207,42,42,0)",
                          "0 0 14px rgba(207,42,42,0.18)",
                          "0 0 0px rgba(207,42,42,0)",
                        ],
                      }
                }
                transition={{
                  duration: 2.8,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                24 execuções
              </motion.div>
            </motion.div>

            {/* Chart */}
            <motion.div
              className="relative h-48 overflow-hidden rounded-xl border border-base-content/10 bg-base-200/50 p-4"
              {...reveal(0.3)}
            >
              {/* Background grid */}
              <div className="absolute inset-0 opacity-70">
                {[25, 50, 75].map((position) => (
                  <motion.div
                    key={position}
                    className="absolute inset-x-4 border-t border-dashed border-base-content/10"
                    style={{ top: `${position}%` }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{
                      delay: 0.6 + position / 100,
                      duration: 0.5,
                    }}
                  />
                ))}
              </div>

              {/* Vertical guide */}
              {!reduceMotion && (
                <motion.div
                  className="absolute bottom-4 top-4 w-px bg-primary/10"
                  animate={{
                    left: ["8%", "92%", "8%"],
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              )}

              <svg
                viewBox="0 0 500 160"
                className="absolute inset-4 h-[calc(100%-2rem)] w-[calc(100%-2rem)]"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient
                    id="labtestGradient"
                    x1="0"
                    x2="0"
                    y1="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor="#CF2A2A"
                      stopOpacity="0.25"
                    />
                    <stop
                      offset="100%"
                      stopColor="#CF2A2A"
                      stopOpacity="0"
                    />
                  </linearGradient>

                  <filter id="chartGlow">
                    <feGaussianBlur
                      stdDeviation="3"
                      result="coloredBlur"
                    />
                    <feMerge>
                      <feMergeNode in="coloredBlur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                {/* Area */}
                <motion.path
                  d={`${chartPath} L500 160 L0 160 Z`}
                  fill="url(#labtestGradient)"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{
                    delay: 0.8,
                    duration: 1,
                  }}
                />

                {/* Glow behind line */}
                <motion.path
                  d={chartPath}
                  fill="none"
                  stroke="#CF2A2A"
                  strokeWidth="8"
                  strokeOpacity="0.12"
                  filter="url(#chartGlow)"
                  initial={{
                    pathLength: 0,
                    opacity: 0,
                  }}
                  animate={{
                    pathLength: 1,
                    opacity: 1,
                  }}
                  transition={{
                    duration: 2,
                    delay: 0.45,
                    ease: "easeInOut",
                  }}
                />

                {/* Main line */}
                <motion.path
                  d={chartPath}
                  fill="none"
                  stroke="#CF2A2A"
                  strokeWidth="3"
                  vectorEffect="non-scaling-stroke"
                  initial={
                    reduceMotion
                      ? false
                      : { pathLength: 0 }
                  }
                  animate={{ pathLength: 1 }}
                  transition={{
                    duration: 2,
                    delay: 0.45,
                    ease: "easeInOut",
                  }}
                />

                {/* Moving point */}
                {!reduceMotion && (
                  <>
                    <motion.circle
                      r="9"
                      fill="#CF2A2A"
                      opacity="0.12"
                      animate={{
                        cx: [0, 100, 205, 310, 415, 500],
                        cy: [130, 112, 82, 61, 42, 20],
                      }}
                      transition={{
                        duration: 3.5,
                        delay: 2,
                        repeat: Infinity,
                        repeatDelay: 1,
                        ease: "linear",
                      }}
                    />

                    <motion.circle
                      r="4"
                      fill="#CF2A2A"
                      animate={{
                        cx: [0, 100, 205, 310, 415, 500],
                        cy: [130, 112, 82, 61, 42, 20],
                      }}
                      transition={{
                        duration: 3.5,
                        delay: 2,
                        repeat: Infinity,
                        repeatDelay: 1,
                        ease: "linear",
                      }}
                    />
                  </>
                )}
              </svg>

              {/* Chart status */}
              <motion.div
                className="absolute bottom-3 right-3 flex items-center gap-2 rounded-lg border border-base-content/10 bg-base-100/80 px-2.5 py-1.5 backdrop-blur"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  delay: 1.8,
                  duration: 0.45,
                  ease: "easeInOut",
                }}
              >
                <motion.span
                  className="h-1.5 w-1.5 rounded-full bg-success"
                  animate={
                    reduceMotion
                      ? undefined
                      : {
                          scale: [1, 1.5, 1],
                          opacity: [0.5, 1, 0.5],
                        }
                  }
                  transition={{
                    duration: 1.2,
                    repeat: Infinity,
                  }}
                />

                <span className="text-[10px] font-medium text-base-content/50">
                  análise em tempo real
                </span>
              </motion.div>
            </motion.div>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-3">
              {metrics.map((metric, index) => (
                <motion.div
                  key={metric.label}
                  className="group relative overflow-hidden rounded-xl border border-base-content/10 bg-base-200/40 p-4"
                  initial={{
                    opacity: 0,
                    y: reduceMotion ? 0 : 18,
                    scale: reduceMotion ? 1 : 0.96,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    scale: 1,
                  }}
                  transition={{
                    delay: 1 + index * 0.12,
                    duration: 0.55,
                    ease: "easeInOut"
                  }}
                  whileHover={
                    reduceMotion
                      ? undefined
                      : {
                          y: -5,
                          scale: 1.025,
                          transition: {
                            duration: 0.2,
                          },
                        }
                  }
                >
                  {/* Hover shine */}
                  {!reduceMotion && (
                    <motion.div
                      className="absolute -left-20 top-0 h-full w-12 rotate-12 bg-white/10 blur-md"
                      initial={{ x: 0 }}
                      whileHover={{
                        x: 140,
                        transition: {
                          duration: 0.5,
                        },
                      }}
                    />
                  )}

                  <p className="relative text-xs text-base-content/40">
                    {metric.label}
                  </p>

                  <motion.p
                    className="relative mt-1 text-xl font-bold"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: 1.15 + index * 0.12,
                      duration: 0.4,
                    }}
                  >
                    {metric.value}
                  </motion.p>

                  <motion.p
                    className="relative mt-1 text-[10px] font-semibold text-success"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{
                      delay: 1.35 + index * 0.12,
                    }}
                  >
                    {metric.change}
                  </motion.p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Floating performance card */}
      <motion.div
        className="absolute -bottom-5 -left-5 hidden rounded-tl-2xl rounded-br-2xl rounded-tr-lg rounded-bl-lg border border-base-content/10 bg-base-100 p-4 shadow-xl sm:block"
        initial={{
          opacity: 0,
          x: reduceMotion ? 0 : -25,
          y: reduceMotion ? 0 : 10,
        }}
        animate={{
          opacity: 1,
          x: 0,
          y: reduceMotion ? 0 : [0, -5, 0],
        }}
        transition={{
          opacity: {
            delay: 1.3,
            duration: 0.5,
          },
          x: {
            delay: 1.3,
            duration: 0.6,
            ease: "easeInOut",
          },
          y: reduceMotion
            ? undefined
            : {
                delay: 1.9,
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              },
        }}
        whileHover={
          reduceMotion
            ? undefined
            : {
                scale: 1.04,
                rotate: -1,
                transition: { duration: 0.2 },
              }
        }
      >
        <div className="flex items-center gap-3">
          <motion.div
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-success/10 text-success"
            animate={
              reduceMotion
                ? undefined
                : {
                    scale: [1, 1.08, 1],
                    rotate: [0, 3, 0],
                  }
            }
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Zap size={19} />
          </motion.div>

          <div>
            <p className="text-xs text-base-content/45">
              Desempenho
            </p>

            <motion.p
              className="font-bold"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                delay: 1.6,
                duration: 0.5,
              }}
            >
              +12.8%
            </motion.p>
          </div>
        </div>
      </motion.div>

      {/* Floating analysis badge */}
      <motion.div
        className="absolute -right-4 -top-4 hidden rounded-xl border border-primary/10 bg-base-100 px-3 py-2 shadow-lg sm:flex"
        initial={{
          opacity: 0,
          x: reduceMotion ? 0 : 20,
          y: reduceMotion ? 0 : -10,
          scale: reduceMotion ? 1 : 0.9,
        }}
        animate={{
          opacity: 1,
          x: 0,
          y: 0,
          scale: 1,
        }}
        transition={{
          delay: 1.5,
          duration: 0.6,
          ease: "easeInOut"
        }}
        whileHover={
          reduceMotion
            ? undefined
            : {
                y: -3,
                scale: 1.04,
              }
        }
      >
        <div className="flex items-center gap-2">
          <motion.div
            className="h-2 w-2 rounded-full bg-primary"
            animate={
              reduceMotion
                ? undefined
                : {
                    scale: [1, 1.5, 1],
                  }
            }
            transition={{
              duration: 1.5,
              repeat: Infinity,
            }}
          />

          <span className="text-[10px] font-semibold uppercase tracking-wider text-base-content/50">
            padrões detectados
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
}
