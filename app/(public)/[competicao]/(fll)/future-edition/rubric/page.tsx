"use client";

import { useMemo, useState } from "react";
import { RUBRIC, LevelKey } from "@/features/rubric/lib/future-edition";
import RubricSheet from "@/features/rubric/components/RubricSheet";
import ScorePanel from "@/features/rubric/components/ScorePanel";
import TitleBlock from "@/features/rubric/components/TitleBlock";
import Header from "@/components/layout/Header";
import { ToolScope, ToolTabs, useToolConfirm } from "@/components/stage";

type TabId = "projeto" | (typeof RUBRIC)[number]["id"];

export default function Home() {
  const { confirm, dialog } = useToolConfirm();
  const [activeTab, setActiveTab] = useState<TabId>("projeto");

  const [teamNumber, setTeamNumber] = useState("");
  const [teamName, setTeamName] = useState("");
  const [room, setRoom] = useState("");

  const [scores, setScores] = useState<Record<string, LevelKey | undefined>>(
    {},
  );
  const [comments, setComments] = useState<Record<string, string>>({});

  const tabs = useMemo(
    () => [
      ...RUBRIC.map((cat) => ({
        id: cat.id as TabId,
        code: cat.code,
        label: cat.name,
      })),
    ],
    [RUBRIC],
  );

  function handleSelect(indicatorId: string, level: LevelKey) {
    setScores((prev) => ({ ...prev, [indicatorId]: level }));
  }

  function handleComment(indicatorId: string, value: string) {
    setComments((prev) => ({ ...prev, [indicatorId]: value }));
  }

  async function handleReset() {
    if (
      await confirm({
        title: "Limpar a rubrica?",
        message:
          "Todas as pontuações, comentários e feedbacks preenchidos serão apagados.",
        confirmLabel: "Limpar",
      })
    ) {
      setScores({});
      setComments({});
    }
  }

  function handlePrint() {
    window.print();
  }

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 space-y-8 pb-8 pt-4">
      <Header
        type="Avaliação"
        name="Rubricas"
        highlight="Projeto & Engenharia"
        description="Preencha a identificação da equipe, registre o feedback da sessão e marque o nível de cada indicador (1 a 4) observado na apresentação. A pontuação é calculada automaticamente no painel ao lado."
      />

      <ToolScope className="space-y-4 rounded-tl-[1.5rem] rounded-br-[1.5rem] border border-base-300 p-4 sm:p-5">
        <TitleBlock
          teamNumber={teamNumber}
          setTeamNumber={setTeamNumber}
          teamName={teamName}
          setTeamName={setTeamName}
          room={room}
          setRoom={setRoom}
        />

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px] [&>*]:min-w-0">
          <div>
            <ToolTabs
              tabs={tabs.map((t) => ({ value: t.id, label: t.label }))}
              value={activeTab}
              onChange={setActiveTab}
              className="no-print mb-4"
            />

            {RUBRIC.map((cat) => (
              <section
                key={cat.id}
                className={
                  cat.id === activeTab ? "block" : "hidden print:block"
                }
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

          <aside className="self-start lg:sticky lg:top-20">
            <ScorePanel
              scores={scores}
              comments={comments}
              onReset={handleReset}
              onPrint={handlePrint}
              rubric={RUBRIC}
            />
          </aside>
        </div>
      </ToolScope>
      {dialog}
    </main>
  );
}
