"use client";

import { useState } from "react";
import { QuickActions } from "./QuickActions";
import LabTestForm from "./LabTest/LabTestForm";
import CreateDiagramModal from "./InnoLab/CreateDiagramModal";
import { EventModal } from "../showLive/EventModal";
import StyleLabModal from "./StyleLab/StyleLabModal";
import { BaseModal } from "./UI/BaseModal";

type ActiveModal = "test" | "document" | "event" | "style" | null;

export default function DashboardQuickActions({ session }: { session: any }) {
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);

  const closeModal = () => setActiveModal(null);

  return (
    <>
      <QuickActions onAction={setActiveModal} />

      {/* TESTE */}
      {activeModal === "test" && (
        <BaseModal
          open
          onClose={closeModal}
          title="Novo Teste"
          description="Crie testes de missões individuais ou em grupo"
          size="lg"
        >
          <LabTestForm onCancel={closeModal} onSuccess={closeModal} />
        </BaseModal>
      )}

      {/* DOCUMENTO */}
      {activeModal === "document" && (
        <CreateDiagramModal
          open={activeModal === "document"}
          onClose={() => setActiveModal(null)}
        />
      )}

      {/* EVENTO */}
      {activeModal === "event" && (
        <EventModal
          open={activeModal === "event"}
          onClose={() => setActiveModal(null)}
          session={session}
        />
      )}

      {/* ESTILO */}
      {activeModal === "style" && <StyleLabModal onClose={closeModal} />}
    </>
  );
}
