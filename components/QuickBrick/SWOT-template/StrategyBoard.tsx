'use client';
import React, { useState, useCallback, useRef, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import html2canvas from "html2canvas-pro";
import { jsPDF } from "jspdf";
import {
  SwotCategory,
  SwotItem,
  SwotState,
  QUADRANT_CONFIGS,
} from "@/types/SWOTTemplateType";
import { SwotQuadrant } from "./SwotQuadrant";
import {
  RotateCcw,
  FileDown,
  Loader2,
  Plus,
  Shield,
  AlertTriangle,
  Lightbulb,
  Swords,
} from "lucide-react";

const iconMap = {
  Shield,
  AlertTriangle,
  Lightbulb,
  Swords,
};

export const StrategyBoard: React.FC = () => {
  const [swotData, setSwotData] = useState<SwotState>({
    strengths: [],
    weaknesses: [],
    opportunities: [],
    threats: [],
  });

  // 🟦 Carregar do localStorage APENAS no navegador
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("fll_swot_data");
      if (saved) {
        try {
          setSwotData(JSON.parse(saved));
        } catch {
          localStorage.removeItem("fll_swot_data");
        }
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("fll_swot_data", JSON.stringify(swotData));
    }
  }, [swotData]);

  const [isExporting, setIsExporting] = useState(false);

  // Global Input State
  const [globalInputText, setGlobalInputText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<SwotCategory>(
    SwotCategory.Strengths
  );

  const contentRef = useRef<HTMLDivElement>(null);

  // Save to local storage whenever swotData changes
  useEffect(() => {
    localStorage.setItem("fll_swot_data", JSON.stringify(swotData));
  }, [swotData]);

  // --- Handlers ---
  const addItem = useCallback((category: SwotCategory, text: string) => {
    const newItem: SwotItem = { id: uuidv4(), text };
    setSwotData((prev) => ({
      ...prev,
      [category]: [...prev[category], newItem],
    }));
  }, []);

  const handleGlobalAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (globalInputText.trim()) {
      addItem(selectedCategory, globalInputText.trim());
      setGlobalInputText("");
    }
  };

  const updateItem = useCallback(
    (category: SwotCategory, id: string, newText: string) => {
      setSwotData((prev) => ({
        ...prev,
        [category]: prev[category].map((item) =>
          item.id === id ? { ...item, text: newText } : item
        ),
      }));
    },
    []
  );

  const deleteItem = useCallback((category: SwotCategory, id: string) => {
    setSwotData((prev) => ({
      ...prev,
      [category]: prev[category].filter((item) => item.id !== id),
    }));
  }, []);

  const moveItem = useCallback(
    (itemId: string, fromCategory: SwotCategory, toCategory: SwotCategory) => {
      if (fromCategory === toCategory) return;

      setSwotData((prev) => {
        const sourceList = prev[fromCategory];
        const itemToMove = sourceList.find((i) => i.id === itemId);

        if (!itemToMove) return prev;

        return {
          ...prev,
          [fromCategory]: sourceList.filter((i) => i.id !== itemId),
          [toCategory]: [...prev[toCategory], itemToMove],
        };
      });
    },
    []
  );

  const clearBoard = useCallback(() => {
    if (
      window.confirm("Tem certeza que deseja limpar todo o quadro do time?")
    ) {
      setSwotData({
        strengths: [],
        weaknesses: [],
        opportunities: [],
        threats: [],
      });
    }
  }, []);

  const handleExportPdf = async () => {
    const originalBoard = contentRef.current;
    if (!originalBoard) return;

    setIsExporting(true);

    try {
      // Get Team Data from LocalStorage for the Header
      const teamDataStr = localStorage.getItem("fll_team_info");
      const teamData = teamDataStr
        ? JSON.parse(teamDataStr)
        : { name: "Time FLL", number: "0000" };

      const exportContainer = document.createElement("div");
      exportContainer.style.position = "absolute";
      exportContainer.style.top = "-9999px";
      exportContainer.style.left = "-9999px";
      exportContainer.style.width = "1200px"; // Fixed width for A4 Landscape consistency
      exportContainer.style.backgroundColor = "#ffffff";
      exportContainer.style.padding = "40px";
      exportContainer.className = "font-sans text-slate-900";

      // Custom PDF Header
      const header = document.createElement("div");
      header.className =
        "flex justify-between items-end mb-10 border-b-4 border-red-600 pb-4";
      header.innerHTML = `
        <div>
          <h1 class="text-4xl font-black text-red-600 uppercase tracking-tighter leading-none mb-1">Matriz SWOT</h1>
          <p class="text-slate-500 font-bold text-sm uppercase tracking-widest">ROBOSTAGE</p>
        </div>
        <div class="text-right">
          <h2 class="text-3xl font-bold text-slate-800">${
            teamData.name || "Meu Time"
          }</h2>
          <p class="text-slate-500 text-lg">#${
            teamData.number || "0000"
          } • ${new Date().toLocaleDateString()}</p>
        </div>
      `;
      exportContainer.appendChild(header);

      // Clone the board content
      const boardClone = originalBoard.cloneNode(true) as HTMLElement;

      // Style adjustments for print
      boardClone.style.backgroundColor = "transparent";
      boardClone.style.padding = "0";
      boardClone.style.border = "none";

      // Adjust Grid Gap
      const grid = boardClone.querySelector(".grid");
      if (grid) {
        (grid as HTMLElement).style.gap = "20px";
      }

      // CRITICAL: Fix scrollbars to show ALL content
      // Find all scrollable containers and quadrants and expand them
      const scrollables = boardClone.querySelectorAll(".overflow-y-auto");
      scrollables.forEach((el) => {
        (el as HTMLElement).classList.remove("overflow-y-auto");
        (el as HTMLElement).style.overflow = "visible";
        (el as HTMLElement).style.height = "auto";
        (el as HTMLElement).style.maxHeight = "none";
      });

      // Expand parent containers that have fixed height
      const quadrants = boardClone.querySelectorAll(".h-\\[500px\\]");
      quadrants.forEach((el) => {
        (el as HTMLElement).classList.remove("h-[500px]");
        (el as HTMLElement).style.height = "auto";
        (el as HTMLElement).style.minHeight = "250px";
      });

      const relativeParents = boardClone.querySelectorAll(".relative.h-full");
      relativeParents.forEach((el) => {
        (el as HTMLElement).classList.remove("h-full");
        (el as HTMLElement).style.height = "auto";
      });

      // Remove the footer from the clone (we made a better header)
      const footerInClone = boardClone.querySelector(".mt-12");
      if (footerInClone) footerInClone.remove();

      exportContainer.appendChild(boardClone);

      // Append to body for rendering
      document.body.appendChild(exportContainer);

      // Wait a moment for DOM to settle
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Capture
      const canvas = await html2canvas(exportContainer, {
        scale: 2, // High resolution
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
      });

      // Clean up DOM
      document.body.removeChild(exportContainer);

      // Generate PDF
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("l", "mm", "a4");

      const pdfWidth = pdf.internal.pageSize.getWidth();
      pdf.addImage(
        imgData,
        "PNG",
        0,
        0,
        pdfWidth,
        (canvas.height * pdfWidth) / canvas.width
      );

      pdf.save(
        `fll-strategy-${
          teamData.name
            ? teamData.name.replace(/\s+/g, "-").toLowerCase()
            : "team"
        }-${new Date().toISOString().split("T")[0]}.pdf`
      );
    } catch (error) {
      console.error("Failed to export PDF", error);
      alert("Ocorreu um erro ao gerar o PDF. Tente novamente.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Toolbar */}
      <div className="flex justify-end items-center mb-6">
        <div className="flex gap-3">
          <button
            onClick={handleExportPdf}
            disabled={isExporting}
            className="flex items-center gap-2 btn btn-default btn-sm"
          >
            {isExporting ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <FileDown size={18} />
            )}
            {isExporting ? "GERANDO..." : "PDF"}
          </button>
          <button
            onClick={clearBoard}
            className="flex items-center gap-2 btn btn-warning btn-sm"
          >
            <RotateCcw size={18} />
            LIMPAR
          </button>
        </div>
      </div>

      {/* Unified Input Bar */}
      <div className="bg-base-100 p-1.5 rounded-2xl shadow-lg border border-base-200 mb-8 transform hover:scale-[1.01] transition-transform duration-200 z-20 relative">
        <form onSubmit={handleGlobalAdd} className="flex flex-col md:flex-row">
          <div className="flex-1 flex items-center px-4 py-2">
            <input
              type="text"
              value={globalInputText}
              onChange={(e) => setGlobalInputText(e.target.value)}
              placeholder="Escreva sua ideia, problema ou estratégia aqui..."
              className="w-full text-lg outline-none text-base-content placeholder:text-base-content/60 bg-transparent font-medium"
            />
          </div>

          <div className="flex items-center gap-2 p-2 border-t md:border-t-0 md:border-l border-base-300 rounded-b-xl md:rounded-none">
            <div className="flex bg-base-300 p-1 rounded-xl gap-1">
              {QUADRANT_CONFIGS.map((config) => {
                const Icon = iconMap[config.iconName];
                const isSelected = selectedCategory === config.id;
                const activeStyle =
                  config.colorTheme === "emerald"
                    ? "bg-emerald-500 text-white shadow-md"
                    : config.colorTheme === "rose"
                    ? "bg-rose-500 text-white shadow-md"
                    : config.colorTheme === "sky"
                    ? "bg-sky-500 text-white shadow-md"
                    : "bg-amber-500 text-white shadow-md";

                return (
                  <button
                    key={config.id}
                    type="button"
                    onClick={() => setSelectedCategory(config.id)}
                    className={`p-2.5 rounded-lg transition-all duration-200 relative group ${
                      isSelected
                        ? activeStyle
                        : "text-base-content hover:text-slate-600 hover:bg-base-100"
                    }`}
                    title={config.title}
                  >
                    <Icon size={20} />
                    {/* Tooltip */}
                    <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-base-100 text-base-content text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10 shadow-lg">
                      {config.title.split("(")[0]}
                    </span>
                  </button>
                );
              })}
            </div>

            <button
              type="submit"
              disabled={!globalInputText.trim()}
              className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
            >
              <Plus size={24} />
            </button>
          </div>
        </form>
      </div>

      <div ref={contentRef} className="p-2 rounded-xl mt-6">
        {/* Matrix Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 auto-rows-fr">
          {QUADRANT_CONFIGS.map((config) => (
            <div key={config.id} className="h-[500px] relative group">
              {/* Decorative Corner */}
              <div
                className={`absolute -inset-0.5 bg-gradient-to-r 
                ${
                  config.id === "strengths"
                    ? "from-green-400 to-emerald-600"
                    : config.id === "weaknesses"
                    ? "from-red-400 to-rose-600"
                    : config.id === "opportunities"
                    ? "from-sky-400 to-blue-600"
                    : "from-amber-400 to-orange-600"
                } 
                rounded-xl opacity-30 group-hover:opacity-70 blur transition duration-500`}
              ></div>

              <div className="relative h-full bg-white rounded-xl">
                <SwotQuadrant
                  config={config}
                  items={swotData[config.id]}
                  onUpdateItem={updateItem}
                  onDeleteItem={deleteItem}
                  onMoveItem={moveItem}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
