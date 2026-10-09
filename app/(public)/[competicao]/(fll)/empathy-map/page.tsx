"use client";
import { useState, useEffect, useRef, useMemo } from "react";
import { HeaderEM } from "@/components/EmpathyMap/Header";
import Header from "@/components/UI/Header";
import { PersonaBar } from "@/components/EmpathyMap/PersonaBar";
import { BoardView } from "@/components/EmpathyMap/BoardView";
import { AnalysisView } from "@/components/EmpathyMap/AnalysisView";
import { PersonaModal } from "@/components/EmpathyMap/PersonaModal";
import { ExportModal } from "@/components/EmpathyMap/ExportModal";
import { INITIAL_MAPS } from "./initialData";
import {
  EmpathyCategory,
  EmpathyMap,
  EmpathyNote,
  NoteColor,
  Persona,
  ViewMode,
} from "@/types/EmpathyMap.types";
import { MapManagerModal } from "@/components/EmpathyMap/MapManagerModal";
import { HelpModal } from "@/components/EmpathyMap/HelpModal";

const STORAGE_KEY = "mapa_empatia_simple_v2";
const ACTIVE_MAP_KEY = "mapa_empatia_active_v2";

export default function EmpathyMapPage() {
  const [maps, setMaps] = useState<EmpathyMap[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_MAPS;
  });

  const [activeMapId, setActiveMapId] = useState<string>(() => {
    try {
      const savedId = localStorage.getItem(ACTIVE_MAP_KEY);
      if (savedId && maps.some((m) => m.id === savedId)) return savedId;
    } catch {}
    return maps[0]?.id || INITIAL_MAPS[0].id;
  });

  const [currentView, setCurrentView] = useState<ViewMode>("board");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals
  const [isPersonaModalOpen, setIsPersonaModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isMapManagerModalOpen, setIsMapManagerModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

  // Capture ref for PNG exports
  const boardRef = useRef<HTMLDivElement | null>(null);

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(maps));
    } catch {}
  }, [maps]);

  useEffect(() => {
    try {
      localStorage.setItem(ACTIVE_MAP_KEY, activeMapId);
    } catch {}
  }, [activeMapId]);

  const activeMap = useMemo(() => {
    return maps.find((m) => m.id === activeMapId) || maps[0] || INITIAL_MAPS[0];
  }, [maps, activeMapId]);

  // Filter notes by search
  const filteredNotes = useMemo(() => {
    if (!searchQuery.trim()) return activeMap.notes;
    const q = searchQuery.toLowerCase();
    return activeMap.notes.filter(
      (n) =>
        n.text.toLowerCase().includes(q) ||
        (n.author && n.author.toLowerCase().includes(q)),
    );
  }, [activeMap.notes, searchQuery]);

  // Helper to update active map
  const updateActiveMap = (updater: (prev: EmpathyMap) => EmpathyMap) => {
    setMaps((prev) =>
      prev.map((m) => {
        if (m.id === activeMap.id) {
          const updated = updater(m);
          return { ...updated, updatedAt: Date.now() };
        }
        return m;
      }),
    );
  };

  // Instant Add Note
  const handleAddNote = (category: EmpathyCategory, text: string) => {
    let color: NoteColor = "yellow";
    let sentiment: "positive" | "neutral" | "negative" = "neutral";

    if (category === "pains") {
      color = "pink";
      sentiment = "negative";
    } else if (category === "gains") {
      color = "emerald";
      sentiment = "positive";
    } else if (category === "thinks") {
      color = "blue";
    } else if (category === "feels") {
      color = "purple";
    }

    const newNote: EmpathyNote = {
      id: `note-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      text,
      category,
      color,
      author: "",
      votes: 0,
      sentiment,
      tags: [],
      createdAt: Date.now(),
    };

    updateActiveMap((map) => ({
      ...map,
      notes: [newNote, ...map.notes],
    }));
  };

  // Inline Note Updates
  const handleUpdateNoteText = (id: string, text: string) => {
    updateActiveMap((map) => ({
      ...map,
      notes: map.notes.map((n) => (n.id === id ? { ...n, text } : n)),
    }));
  };

  const handleChangeNoteColor = (id: string, color: NoteColor) => {
    updateActiveMap((map) => ({
      ...map,
      notes: map.notes.map((n) => (n.id === id ? { ...n, color } : n)),
    }));
  };

  const handleDeleteNote = (id: string) => {
    updateActiveMap((map) => ({
      ...map,
      notes: map.notes.filter((n) => n.id !== id),
    }));
  };

  const handleVoteNote = (id: string) => {
    updateActiveMap((map) => ({
      ...map,
      notes: map.notes.map((n) =>
        n.id === id ? { ...n, votes: n.votes + 1 } : n,
      ),
    }));
  };

  const handleChangeCategory = (id: string, category: EmpathyCategory) => {
    updateActiveMap((map) => ({
      ...map,
      notes: map.notes.map((n) => (n.id === id ? { ...n, category } : n)),
    }));
  };

  // Persona Update
  const handleSavePersona = (updatedPersona: Persona) => {
    updateActiveMap((map) => ({
      ...map,
      persona: updatedPersona,
    }));
  };

  // Map Switchers
  const handleCreateNewMap = (title: string, personaName: string) => {
    const newId = `map-${Date.now()}`;
    const newMap: EmpathyMap = {
      id: newId,
      title,
      description: "",
      createdAt: Date.now(),
      updatedAt: Date.now(),
      persona: {
        id: `persona-${Date.now()}`,
        name: personaName,
        role: "Perfil de Usuário",
        segment: "",
        context: "",
        avatarUrl: "",
      },
      notes: [],
    };
    setMaps((prev) => [newMap, ...prev]);
    setActiveMapId(newId);
  };

  const handleDeleteMap = (id: string) => {
    if (maps.length <= 1) return;
    setMaps((prev) => prev.filter((m) => m.id !== id));
    if (activeMapId === id) {
      const remaining = maps.filter((m) => m.id !== id);
      setActiveMapId(remaining[0].id);
    }
  };

  const handleResetTemplates = () => {
    setMaps(INITIAL_MAPS);
    setActiveMapId(INITIAL_MAPS[0].id);
  };

  const handleImportMap = (imported: EmpathyMap) => {
    const newId = `map-${Date.now()}`;
    setMaps((prev) => [{ ...imported, id: newId }, ...prev]);
    setActiveMapId(newId);
  };

  return (
    <main className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col space-y-8 px-4 pt-8 pb-16 font-sans text-base-content">
      <Header
        type="Diagramas"
        name="Mapa de Empatia"
        highlight=""
        description="Explore insights sobre o profissional/usuário, suas dores, ganhos e sentimentos. Crie notas, organize ideias e analise padrões para entender melhor a persona."
      />

      <HeaderEM
        currentView={currentView}
        onViewChange={setCurrentView}
        onOpenExport={() => setIsExportModalOpen(true)}
        onOpenMapManager={() => setIsMapManagerModalOpen(true)}
        onOpenHelp={() => setIsHelpModalOpen(true)}
        mapTitle={activeMap.title}
      />

      {/* Main Content */}
      <section className="min-w-0 flex-1 space-y-6">
        {currentView === "board" ? (
          <>
            {/* Persona and Search */}
            <PersonaBar
              persona={activeMap.persona}
              onEditPersona={() => setIsPersonaModalOpen(true)}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              totalNotes={activeMap.notes.length}
            />

            <BoardView
              notes={filteredNotes}
              onAddNote={handleAddNote}
              onUpdateNoteText={handleUpdateNoteText}
              onChangeNoteColor={handleChangeNoteColor}
              onDeleteNote={handleDeleteNote}
              onVoteNote={handleVoteNote}
              onChangeCategory={handleChangeCategory}
              boardRef={boardRef}
            />
          </>
        ) : (
          <section className="rounded-box border border-base-300/60 bg-base-100/70 p-4 shadow-sm sm:p-6">
            <AnalysisView map={activeMap} />
          </section>
        )}
      </section>

      {/* Modals */}
      <PersonaModal
        isOpen={isPersonaModalOpen}
        onClose={() => setIsPersonaModalOpen(false)}
        persona={activeMap.persona}
        onSave={handleSavePersona}
      />

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        map={activeMap}
        canvasRef={boardRef}
        onImportMap={handleImportMap}
      />

      <MapManagerModal
        isOpen={isMapManagerModalOpen}
        onClose={() => setIsMapManagerModalOpen(false)}
        maps={maps}
        activeMapId={activeMapId}
        onSelectMap={setActiveMapId}
        onCreateNewMap={handleCreateNewMap}
        onDuplicateMap={() => {}}
        onDeleteMap={handleDeleteMap}
        onResetTemplates={handleResetTemplates}
      />

      <HelpModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
      />
    </main>
  );
}
