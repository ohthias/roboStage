"use client";
import React, { useState, useMemo, useCallback, useEffect } from "react";
import { ControlPanel } from "@/components/QuickBrick/RobotTrack/ControlPanel";
import { TrajectoryCanvas } from "@/components/QuickBrick/RobotTrack/TrajectoryCanvas";
import { useRobotAnimation } from "@/hooks/useRobotAnimation";
import type {
  Movement,
  Point,
  CreatorSpeeds,
  CreatorAnalytics,
} from "@/types/RobotTrackType";
import {
  INITIAL_MOVEMENTS,
  INITIAL_X_CM,
  INITIAL_Y_CM,
  INITIAL_ANGLE,
} from "./constants";
import { calculatePathFromMovements } from "@/utils/path";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/ui/Footer";
import Breadcrumbs from "@/components/Breadcrumbs";

const RobotTrackPage = () => {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkSize = () => setIsMobile(window.innerWidth <= 720);
    checkSize();
    window.addEventListener("resize", checkSize);
    return () => window.removeEventListener("resize", checkSize);
  }, []);

  const [zoom, setZoom] = useState<number>(1.0);
  const [speed, setSpeed] = useState<number>(1.0);
  const [movements, setMovements] = useState<Movement[]>(INITIAL_MOVEMENTS);
  const [isCreating, setIsCreating] = useState<boolean>(false);

  const [creatorMovementsHistory, setCreatorMovementsHistory] = useState<
    Movement[][]
  >([[]]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);
  const creatorMovements = creatorMovementsHistory[historyIndex] || [];

  const [creatorSpeeds, setCreatorSpeeds] = useState<CreatorSpeeds>({
    straight: 50,
    turn: 90,
  });

  const { robotState, path, play, pause, reset, mousePos, setMousePos } =
    useRobotAnimation({
      movements,
      speed,
    });

  const creatorPath = useMemo(() => {
    return calculatePathFromMovements(creatorMovements);
  }, [creatorMovements]);

  const creatorAnalytics = useMemo<CreatorAnalytics>(() => {
    let totalDistance = 0;
    let totalRotation = 0;
    let estimatedTime = 0;

    for (const move of creatorMovements) {
      if (move.type === "reto") {
        totalDistance += move.value;
        if (move.speed > 0) {
          estimatedTime += move.value / move.speed;
        }
      } else if (move.type === "giro") {
        totalRotation += Math.abs(move.value);
        if (move.speed > 0) {
          estimatedTime += Math.abs(move.value) / move.speed;
        }
      }
    }
    return { totalDistance, totalRotation, estimatedTime };
  }, [creatorMovements]);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < creatorMovementsHistory.length - 1;

  const handleStartCreating = () => {
    setIsCreating(true);
    setCreatorMovementsHistory([[]]);
    setHistoryIndex(0);
  };

  const handleCancelCreating = () => {
    setIsCreating(false);
    setCreatorMovementsHistory([[]]);
    setHistoryIndex(0);
  };

  const handleFinishCreating = () => {
    if (creatorMovements.length > 0) {
      setMovements(creatorMovements);
    }
    setIsCreating(false);
    setCreatorMovementsHistory([[]]);
    setHistoryIndex(0);
  };

  const handleAddPoint = useCallback(
    (newPos: { x_cm: number; y_cm: number }) => {
      const lastPoint = calculatePathFromMovements(creatorMovements).pop() || {
        x_cm: INITIAL_X_CM,
        y_cm: INITIAL_Y_CM,
        angle: INITIAL_ANGLE,
      };

      const deltaX = newPos.x_cm - lastPoint.x_cm;
      const deltaY = newPos.y_cm - lastPoint.y_cm;
      const targetAngle = (Math.atan2(deltaX, deltaY) * 180) / Math.PI;

      let turnAngle = targetAngle - lastPoint.angle;
      if (turnAngle > 180) turnAngle -= 360;
      if (turnAngle < -180) turnAngle += 360;
      const distance = Math.hypot(deltaX, deltaY);

      const newMoves: Movement[] = [];
      if (Math.abs(turnAngle) > 0.1) {
        newMoves.push({
          type: "giro",
          value: turnAngle,
          speed: creatorSpeeds.turn,
        });
      }
      if (distance > 0.1) {
        newMoves.push({
          type: "reto",
          value: distance,
          speed: creatorSpeeds.straight,
        });
      }

      const newCreatorMovements = [...creatorMovements, ...newMoves];
      const newHistory = creatorMovementsHistory.slice(0, historyIndex + 1);
      newHistory.push(newCreatorMovements);
      setCreatorMovementsHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    },
    [creatorSpeeds, creatorMovements, historyIndex, creatorMovementsHistory]
  );

  const handleUndo = () => {
    if (canUndo) {
      setHistoryIndex((prev) => prev - 1);
    }
  };

  const handleRedo = () => {
    if (canRedo) {
      setHistoryIndex((prev) => prev + 1);
    }
  };

  const handleSavePath = () => {
    try {
      localStorage.setItem("robot-trajectory", JSON.stringify(movements));
      alert("Path saved successfully!");
    } catch (error) {
      console.error("Failed to save path:", error);
      alert("Could not save path to local storage.");
    }
  };

  const handleLoadPath = () => {
    const savedPathJSON = localStorage.getItem("robot-trajectory");
    if (!savedPathJSON) {
      alert("No saved path found.");
      return;
    }
    try {
      const savedMovements = JSON.parse(savedPathJSON);
      if (
        Array.isArray(savedMovements) &&
        (savedMovements.length === 0 ||
          (savedMovements[0].type &&
            typeof savedMovements[0].value === "number"))
      ) {
        setMovements(savedMovements);
        alert("Path loaded successfully!");
      } else {
        throw new Error("Invalid path format in storage.");
      }
    } catch (error) {
      console.error("Failed to load path:", error);
      alert("Failed to load path. Data might be corrupted.");
      localStorage.removeItem("robot-trajectory");
    }
  };

  if (isMobile) {
    return (
      <div className="flex flex-col items-center justify-center text-center">
        <Navbar />
        <h1 className="text-2xl font-bold my-4 text-primary">
          Ops! Ferramenta não está disponível no celular
        </h1>
        <p className="text-sm mb-2 text-base-content px-5">
          O Robot Track é uma ferramenta que ajuda seu time a planejar e visualizar
          as trajetórias do robô na FIRST LEGO League Challenge. No momento, ela está disponível apenas
          em telas maiores, como notebooks e desktops.
        </p>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <Breadcrumbs />
      <header className="p-2 text-center">
        <h1 className="text-4xl font-bold text-primary mb-4">UNEARTHED Sharks Simulator</h1>
        <p className="text-base-content/75 text-lg leading-relaxed mb-2">
          Crie e visualize trajetórias para o robô da FIRST LEGO League Challenge.
        </p>
        <p className="text-sm text-base-content/50">
          Criado por{" "}
          <a
            href="https://github.com/G-Tomboly"
            className="text-primary hover:underline"
          >
            Sharks
          </a>
          .
        </p>
        <p className="text-sm text-base-content/50">
            Adaptado por RoboStage.
        </p>
      </header>
      <div className="flex flex-col h-screen md:flex-row font-sans p-4 gap-4 ">
        <ControlPanel
          robotState={robotState}
          mousePos={mousePos}
          zoom={zoom}
          onZoomChange={setZoom}
          speed={speed}
          onSpeedChange={setSpeed}
          onPlay={play}
          onPause={pause}
          onReset={reset}
          isCreating={isCreating}
          onStartCreating={handleStartCreating}
          onFinishCreating={handleFinishCreating}
          onCancelCreating={handleCancelCreating}
          creatorSpeeds={creatorSpeeds}
          onCreatorSpeedChange={setCreatorSpeeds}
          creatorAnalytics={creatorAnalytics}
          onSavePath={handleSavePath}
          onLoadPath={handleLoadPath}
          onUndo={handleUndo}
          onRedo={handleRedo}
          canUndo={canUndo}
          canRedo={canRedo}
        />
        <main className="flex-grow flex items-center justify-center bg-base-300 rounded-lg overflow-hidden relative">
          <TrajectoryCanvas
            robotState={robotState}
            path={path}
            zoom={zoom}
            onMouseMove={setMousePos}
            isCreating={isCreating}
            creatorPath={creatorPath}
            onAddPoint={handleAddPoint}
          />
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default RobotTrackPage;
