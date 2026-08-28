"use client";
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Header } from '@/components/thinklab/Header';
import { MarkdownEditor } from '@/components/thinklab//MarkdownEditor';
import { IshikawaDiagram } from '@/components/thinklab//IshikawaDiagram';
import { ExportModal } from '@/components/thinklab//ExportModal';
import { SettingsDrawer } from '@/components/thinklab//SettingsDrawer';
import { parseMarkdownToIshikawa } from '@/utils/thinklab/parser';
import { ISHIKAWA_TEMPLATES } from '@/utils/thinklab/templates';
import { DiagramSettings } from './ishikawa.types';

const STORAGE_KEY_MARKDOWN = 'ishikawa_studio_markdown_v1';
const STORAGE_KEY_SETTINGS = 'ishikawa_studio_settings_v1';
const STORAGE_KEY_THEME = 'ishikawa_studio_daisy_theme_v1';

const DEFAULT_SETTINGS: DiagramSettings = {
  fishDirection: 'right',
  theme: 'bento-indigo',
  showSubCauses: true,
  showGrid: true,
  showRootCauseHighlights: true,
  showCategoryIcons: true,
  boneAngle: 55,
  fontSizeScale: 1.0,
  spineThickness: 3,
  headShape: 'rounded-box',
};

export default function App() {
  const [markdown, setMarkdown] = useState<string>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_MARKDOWN);
    return saved || ISHIKAWA_TEMPLATES[0].markdown;
  });

  const [settings, setSettings] = useState<DiagramSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (saved) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.error('Failed to load saved settings:', e);
    }
    return DEFAULT_SETTINGS;
  });

  const [viewMode, setViewMode] = useState<'split' | 'editor-only' | 'diagram-only'>('split');
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  const svgRef = useRef<SVGSVGElement | null>(null);

  // Auto-save markdown to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_MARKDOWN, markdown);
  }, [markdown]);

  // Auto-save settings to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
  }, [settings]);

  // Parse markdown in real-time
  const parsedData = useMemo(() => {
    return parseMarkdownToIshikawa(markdown);
  }, [markdown]);

  const handleUpdateSettings = (newPartial: Partial<DiagramSettings>) => {
    setSettings((prev) => ({ ...prev, ...newPartial }));
  };

  const handleResetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
  };

  const handleResetToDefault = () => {
    setMarkdown(ISHIKAWA_TEMPLATES[0].markdown);
  };

  return (
    <div
      className="flex flex-col h-screen max-w-7xl w-full mx-auto overflow-hidden font-sans antialiased text-base-content p-2 sm:p-3 md:p-4 gap-2 sm:gap-3 select-none transition-colors duration-200 print:p-0 print:m-0 print:h-auto print:w-full print:overflow-visible print:bg-white"
    >
      <div className="no-print print:hidden">
        <Header
          onOpenExport={() => setIsExportModalOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          settings={settings}
          onUpdateSettings={handleUpdateSettings}
          viewMode={viewMode}
          setViewMode={setViewMode}
        />
      </div>

      {/* Main Workspace Area */}
      <main className="flex-1 overflow-hidden min-h-0 print:overflow-visible print:h-auto print:w-full">
        <div className="w-full h-full grid gap-2 sm:gap-3 md:gap-4 transition-all duration-200 grid-cols-1 md:grid-cols-12 print:block print:w-full print:h-auto">
          {/* Markdown Editor Pane */}
          {(viewMode === 'split' || viewMode === 'editor-only') && (
            <div
              className={`h-full overflow-hidden transition-all duration-200 no-print print:hidden ${
                viewMode === 'split' ? 'md:col-span-5' : 'md:col-span-12'
              }`}
            >
              <MarkdownEditor
                markdown={markdown}
                onChange={setMarkdown}
                parsedData={parsedData}
              />
            </div>
          )}

          {/* Interactive Ishikawa Diagram Canvas Pane */}
          <div
            className={`h-full overflow-hidden transition-all duration-200 print:block print:w-full print:h-auto ${
              viewMode === 'diagram-only'
                ? 'md:col-span-12'
                : viewMode === 'split'
                ? 'md:col-span-7'
                : 'hidden md:hidden'
            }`}
          >
            <IshikawaDiagram
              data={parsedData}
              settings={settings}
              svgRef={svgRef}
              onSelectCause={(causeText) => {
                console.log('Selected cause:', causeText);
              }}
            />
          </div>
        </div>
      </main>

      {/* Modals & Drawers */}
      <div className="no-print print:hidden">
        <ExportModal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          svgRef={svgRef}
          data={parsedData}
          settings={settings}
        />

        <SettingsDrawer
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          settings={settings}
          onUpdateSettings={handleUpdateSettings}
          onResetSettings={handleResetSettings}
        />
      </div>
    </div>
  );
}
