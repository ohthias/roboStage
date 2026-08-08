"use client";

import { useMemo, useState } from "react";
import { RUBRIC, LevelKey } from "./rubric";
import RubricSheet from "@/components/Rubric/RubricSheet";
import FeedbackSheet from "@/components/Rubric/FeedbackSheet";
import ScorePanel from "@/components/Rubric/ScorePanel";
import TitleBlock from "@/components/Rubric/TitleBlock";
import Header from "@/components/UI/Header";

type TabId = "feedback" | (typeof RUBRIC)[number]["id"];

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabId>("feedback");

  const [teamNumber, setTeamNumber] = useState("");
  const [teamName, setTeamName] = useState("");
  const [room, setRoom] = useState("");

  const [scores, setScores] = useState<Record<string, LevelKey | undefined>>(
    {},
  );
  const [comments, setComments] = useState<Record<string, string>>({});

  const [feedback, setFeedback] = useState<
    Record<string, { good: string; reflect: string }>
  >({});
  const [awards, setAwards] = useState<Record<string, boolean>>({});

  const tabs = useMemo(
    () => [
      { id: "feedback" as TabId, code: "FB", label: "Feedback da Sessão" },
      ...RUBRIC.map((cat) => ({
        id: cat.id as TabId,
        code: cat.code,
        label: cat.name,
      })),
    ],
    [],
  );

  function handleSelect(indicatorId: string, level: LevelKey) {
    setScores((prev) => ({ ...prev, [indicatorId]: level }));
  }

  function handleComment(indicatorId: string, value: string) {
    setComments((prev) => ({ ...prev, [indicatorId]: value }));
  }

  function handleFeedbackChange(
    sectionId: string,
    field: "good" | "reflect",
    value: string,
  ) {
    setFeedback((prev) => ({
      ...prev,
      [sectionId]: { ...prev[sectionId], [field]: value } as {
        good: string;
        reflect: string;
      },
    }));
  }

  function handleToggleAward(awardId: string) {
    setAwards((prev) => ({ ...prev, [awardId]: !prev[awardId] }));
  }

  function handleReset() {
    if (
      confirm(
        "Limpar todas as pontuações, comentários e feedbacks preenchidos?",
      )
    ) {
      setScores({});
      setComments({});
      setFeedback({});
      setAwards({});
    }
  }

  function handlePrint() {
    window.print();
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6 py-6">
      <Header
        type="Avaliação"
        name="Rubricas"
        highlight="Inovação & Robô"
        description="Preencha a identificação da equipe, registre o feedback da sessão e marque o nível de cada indicador (1 a 4) observado na apresentação. A pontuação é calculada automaticamente no painel ao lado."
      />

      <div className="mb-6">
        <TitleBlock
          teamNumber={teamNumber}
          setTeamNumber={setTeamNumber}
          teamName={teamName}
          setTeamName={setTeamName}
          room={room}
          setRoom={setRoom}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        <div>
          <div
            role="tablist"
            className="tabs tabs-box bg-base-200/70 mb-4 no-print w-fit flex-wrap"
          >
            {tabs.map((tab) => (
              <a
                key={tab.id}
                role="tab"
                onClick={() => setActiveTab(tab.id)}
                className={`tab font-mono-tech text-xs sm:text-sm gap-2 ${
                  activeTab === tab.id ? "tab-active" : ""
                }`}
              >
                {tab.label}
              </a>
            ))}
          </div>

          <section
            className={
              activeTab === "feedback" ? "block" : "hidden print:block"
            }
          >
            <FeedbackSheet
              feedback={feedback}
              onChange={handleFeedbackChange}
              awards={awards}
              onToggleAward={handleToggleAward}
            />
          </section>

          {RUBRIC.map((cat) => (
            <section
              key={cat.id}
              className={cat.id === activeTab ? "block" : "hidden print:block"}
            >
              <RubricSheet
                category={cat}
                scores={scores}
                comments={comments}
                onSelect={handleSelect}
                onComment={handleComment}
              />
            </section>
          ))}
        </div>

        <aside className="lg:sticky lg:top-4 self-start">
          <ScorePanel
            scores={scores}
            comments={comments}
            onReset={handleReset}
            onPrint={handlePrint}
          />
        </aside>
      </div>
    </main>
  );
}
