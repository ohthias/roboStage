'use client';
import { useParams } from 'next/navigation';
import { getThinkLabById, saveThinkLab } from '../../../../dashboard/thinklab/actions';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { elementDisplayName } from '@/components/thinklab/LayersPanel';
import { Navbar, SaveStatus } from '@/components/thinklab/Navbar';
import { Toolbar } from '@/components/thinklab/Toolbar';
import { PropertiesPanel } from '@/components/thinklab/PropertiesPanel';
import { ExportModal } from '@/components/thinklab/ExportModal';
import { DatabaseJsonbModal } from '@/components/thinklab/DatabaseJsonbModal';
import { TemplatesModal } from '@/components/thinklab/TemplatesModal';
import { ShortcutsModal } from '@/components/thinklab/ShortcutsModal';
import { EditorSidebar } from '@/components/thinklab/EditorSidebar';
import { CanvasControls, SelectionActions } from '@/components/thinklab/CanvasControls';
import { cn } from '@/components/thinklab/editor-ui';
import { EditorLoader } from '@/components/thinklab/EditorLoader';
import { GraphicAssetsModal } from '@/components/thinklab/GraphicAssetsModal';
import { Canvas } from '@/components/thinklab/Canvas';
import {
  CanvasElement,
  FillStyle,
  FontFamily,
  FontSize,
  GraphicAsset,
  Point,
  StrokeStyle,
  TextAlign,
  ToolType,
  ViewportState,
} from '@/types/thinklab.types';
import { DIAGRAM_TEMPLATES } from '@/utils/thinklab/templates';

import { unwrapAction } from "@/utils/stagebook/action-result";
const STORAGE_KEY = 'excaliflow_saved_diagram_v1';

// Chaves de estilo que também viram o padrão dos próximos elementos desenhados
const DEFAULT_STYLE_KEYS = new Set([
  'strokeColor',
  'backgroundColor',
  'fillStyle',
  'strokeWidth',
  'strokeStyle',
  'roughness',
  'opacity',
  'roundness',
  'fontSize',
  'fontFamily',
  'textAlign',
]);

export default function ThinkLabCanvas() {
    const { id } = useParams<{ id: string }>();
  const [databaseLoaded, setDatabaseLoaded] = useState(false);
  const [title, setTitle] = useState<string>('');
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  // Elements state & history with lazy initialization
  const [elements, setElements] = useState<CanvasElement[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch {
          // ignore
        }
      }
    }
    return DIAGRAM_TEMPLATES[0].elements;
  });

  const [history, setHistory] = useState<CanvasElement[][]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return [parsed];
        } catch {
          // ignore
        }
      }
    }
    return [DIAGRAM_TEMPLATES[0].elements];
  });
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  // Multi-selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeTool, setActiveTool] = useState<ToolType>('select');

  // Viewport
  const [viewport, setViewport] = useState<ViewportState>({
    panX: 80,
    panY: 30,
    zoom: 1.0,
  });

  // Grid
  const [gridType, setGridType] = useState<'dots' | 'lines' | 'none'>('dots');

  // Tema salvo no config do ThinkLab (mantido por compatibilidade; a UI segue o tema do app)
  const [theme, setTheme] = useState<string>('light');

  // Modals & panels
  const [exportOpen, setExportOpen] = useState(false);
  const [databaseJsonbOpen, setDatabaseJsonbOpen] = useState(false);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  // Em telas grandes as duas colunas ficam sempre visíveis; estes estados controlam
  // as gavetas sobrepostas em telas menores.
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [focusSearchSignal, setFocusSearchSignal] = useState(0);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [graphicAssetsOpen, setGraphicAssetsOpen] = useState(false);
  const [smartSnapping, setSmartSnapping] = useState(true);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    getThinkLabById(id)
      .then((thinkLab) => {
        if (cancelled) return;
        if (thinkLab?.name) setTitle(thinkLab.name);
        const config = (thinkLab?.config ?? {}) as {
          elements?: CanvasElement[];
          viewport?: ViewportState;
          gridType?: 'dots' | 'lines' | 'none';
          theme?: string;
        };
        if (Array.isArray(config.elements)) {
          setElements(config.elements);
          setHistory([config.elements]);
          setHistoryIndex(0);
        }
        if (config.viewport) setViewport(config.viewport);
        if (config.gridType) setGridType(config.gridType);
        if (config.theme) setTheme(config.theme);
        setDatabaseLoaded(true);
      })
      .catch(() => setDatabaseLoaded(true));
    return () => {
      cancelled = true;
    };
  }, [id]);

  // Default styles
  const [defaultStyles, setDefaultStyles] = useState<{
    strokeColor: string;
    backgroundColor: string;
    fillStyle: FillStyle;
    strokeWidth: number;
    strokeStyle: StrokeStyle;
    roughness: number;
    opacity: number;
    roundness: boolean;
    fontSize: FontSize;
    fontFamily: FontFamily;
    textAlign: TextAlign;
  }>({
    strokeColor: '#1e293b',
    backgroundColor: '#dbeafe',
    fillStyle: 'hachure',
    strokeWidth: 2,
    strokeStyle: 'solid',
    roughness: 1.2,
    opacity: 1,
    roundness: true,
    fontSize: 18,
    fontFamily: 'Patrick Hand',
    textAlign: 'center',
  });

  // Show Toast
  const notify = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 3000);
  }, []);

  // Persistência no banco: salvamento automático (debounce) + botão "Salvar"
  const persist = useCallback(async () => {
    setSaveStatus('saving');
    try {
      unwrapAction(await saveThinkLab(id, { elements, viewport, gridType, theme }));
      setSaveStatus('saved');
      return true;
    } catch {
      setSaveStatus('error');
      notify('Não foi possível salvar o ThinkLab no banco.');
      return false;
    }
  }, [id, elements, viewport, gridType, theme, notify]);

  useEffect(() => {
    if (!databaseLoaded) return;
    const timeout = window.setTimeout(() => {
      void persist();
    }, 800);
    return () => window.clearTimeout(timeout);
  }, [databaseLoaded, persist]);

  const handleSaveNow = useCallback(async () => {
    if (await persist()) notify('ThinkLab salvo.');
  }, [persist, notify]);

  // Push to history
  const commitElements = useCallback(
    (newElements: CanvasElement[], recordHistory = true) => {
      setElements(newElements);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newElements));
      } catch {
        // Storage full or unavailable
      }

      if (recordHistory) {
        setHistory((prev) => {
          const updated = prev.slice(0, historyIndex + 1);
          return [...updated, newElements];
        });
        setHistoryIndex((prev) => prev + 1);
      }
    },
    [historyIndex]
  );

  // Undo
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const prevIdx = historyIndex - 1;
      const prevElements = history[prevIdx];
      setElements(prevElements);
      setHistoryIndex(prevIdx);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prevElements));
      setSelectedIds((curr) => curr.filter((id) => prevElements.some((e) => e.id === id)));
    }
  }, [historyIndex, history]);

  // Redo
  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextIdx = historyIndex + 1;
      const nextElements = history[nextIdx];
      setElements(nextElements);
      setHistoryIndex(nextIdx);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextElements));
    }
  }, [historyIndex, history]);

  // Zoom controls
  const handleZoomIn = () => {
    setViewport((v) => ({ ...v, zoom: Math.min(3.0, Number((v.zoom + 0.1).toFixed(1))) }));
  };

  const handleZoomOut = () => {
    setViewport((v) => ({ ...v, zoom: Math.max(0.2, Number((v.zoom - 0.1).toFixed(1))) }));
  };

  const handleResetZoom = () => {
    setViewport((v) => ({ ...v, zoom: 1.0, panX: 80, panY: 30 }));
  };

  // Grid toggle
  const handleToggleGrid = () => {
    setGridType((curr) => {
      if (curr === 'dots') return 'lines';
      if (curr === 'lines') return 'none';
      return 'dots';
    });
  };

  // Clear Canvas
  const handleClearCanvas = () => {
    if (window.confirm('Deseja limpar todos os elementos do canvas?')) {
      commitElements([], true);
      setSelectedIds([]);
      notify('Canvas limpo com sucesso.');
    }
  };

  // Load Template
  const handleLoadTemplate = (templateElements: CanvasElement[], mode: 'replace' | 'append') => {
    if (mode === 'replace') {
      commitElements(templateElements, true);
      setSelectedIds([]);
      setViewport({ panX: 40, panY: 30, zoom: 0.95 });
      notify('Modelo carregado com sucesso!');
    } else {
      const offsetElements = templateElements.map((el) => ({
        ...el,
        id: `el-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        x: el.x + 120,
        y: el.y + 120,
        zIndex: elements.length + el.zIndex,
      }));
      commitElements([...elements, ...offsetElements], true);
      notify('Elementos adicionados ao canvas atual!');
    }
  };

  // Drop component or graphic asset from Library
  const handleDropComponent = (template: Record<string, unknown>, dropPoint: Point) => {
    // If dragging a composite graphic asset
    if (template.isGraphicAsset && Array.isArray(template.elements)) {
      const assetElements = template.elements as Omit<CanvasElement, 'id' | 'zIndex'>[];
      let minX = Infinity,
        minY = Infinity,
        maxX = -Infinity,
        maxY = -Infinity;

      assetElements.forEach((el) => {
        minX = Math.min(minX, el.x);
        minY = Math.min(minY, el.y);
        maxX = Math.max(maxX, el.x + (el.width || 0));
        maxY = Math.max(maxY, el.y + (el.height || 0));
      });

      const assetW = maxX - minX || 160;
      const assetH = maxY - minY || 100;
      const offsetX = dropPoint.x - minX - assetW / 2;
      const offsetY = dropPoint.y - minY - assetH / 2;

      const newGroupId = `grp-${Date.now()}`;
      const newElements: CanvasElement[] = assetElements.map((el, idx) => ({
        ...el,
        id: `asset-${Date.now()}-${idx}`,
        x: el.x + offsetX,
        y: el.y + offsetY,
        groupId: newGroupId,
        zIndex: elements.length + idx + 1,
      }));

      commitElements([...elements, ...newElements], true);
      setSelectedIds(newElements.map((e) => e.id));
      notify(`Elemento gráfico "${(template.name as string) || 'Pronto'}" adicionado!`);
      return;
    }

    // Standard shape component
    const width = (template.width as number) || 160;
    const height = (template.height as number) || 70;
    const newEl: CanvasElement = {
      ...(template as any),
      id: `comp-${Date.now()}`,
      x: dropPoint.x - width / 2,
      y: dropPoint.y - height / 2,
      width,
      height,
      zIndex: elements.length + 1,
    };

    commitElements([...elements, newEl], true);
    setSelectedIds([newEl.id]);
    notify(`"${elementDisplayName(newEl)}" adicionado!`);
  };

  // Helper to get true canvas center coordinates based on current window size and viewport
  const getCanvasCenter = useCallback(() => {
    const w = canvasSize.width || 800;
    const h = canvasSize.height || 600;
    return {
      x: (w / 2 - viewport.panX) / viewport.zoom,
      y: (h / 2 - viewport.panY) / viewport.zoom,
    };
  }, [viewport, canvasSize]);

  // Inserções seguidas no mesmo centro descem em cascata para não se sobreporem
  const lastInsertRef = useRef<{ x: number; y: number; count: number } | null>(null);
  const getInsertPoint = useCallback(() => {
    const center = getCanvasCenter();
    const last = lastInsertRef.current;
    const count =
      last && Math.abs(last.x - center.x) < 1 && Math.abs(last.y - center.y) < 1 ? (last.count + 1) % 8 : 0;
    lastInsertRef.current = { ...center, count };
    const step = 32 / viewport.zoom;
    return { x: center.x + count * step, y: center.y + count * step };
  }, [getCanvasCenter, viewport.zoom]);

  // Click insert graphic asset
  const handleInsertGraphicAsset = (
    assetElements: GraphicAsset['elements'],
    assetName: string
  ) => {
    const center = getInsertPoint();
    const centerX = center.x;
    const centerY = center.y;

    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;

    assetElements.forEach((el) => {
      minX = Math.min(minX, el.x);
      minY = Math.min(minY, el.y);
      maxX = Math.max(maxX, el.x + (el.width || 0));
      maxY = Math.max(maxY, el.y + (el.height || 0));
    });

    const assetW = maxX - minX || 160;
    const assetH = maxY - minY || 100;
    const offsetX = centerX - minX - assetW / 2;
    const offsetY = centerY - minY - assetH / 2;

    const newGroupId = `grp-${Date.now()}`;
    const newElements: CanvasElement[] = assetElements.map((el, idx) => ({
      ...el,
      id: `asset-${Date.now()}-${idx}`,
      x: el.x + offsetX,
      y: el.y + offsetY,
      groupId: newGroupId,
      zIndex: elements.length + idx + 1,
    }));

    commitElements([...elements, ...newElements], true);
    setSelectedIds(newElements.map((e) => e.id));
    notify(`Elemento gráfico "${assetName}" inserido!`);
  };

  // Click insert from Component Library
  const handleInsertComponent = (template: Record<string, unknown>) => {
    const width = (template.width as number) || 160;
    const height = (template.height as number) || 70;
    const center = getInsertPoint();
    const centerX = center.x;
    const centerY = center.y;

    const newEl: CanvasElement = {
      ...(template as any),
      id: `comp-${Date.now()}`,
      x: centerX - width / 2,
      y: centerY - height / 2,
      width,
      height,
      zIndex: elements.length + 1,
    };

    commitElements([...elements, newEl], true);
    setSelectedIds([newEl.id]);
    notify(`"${elementDisplayName(newEl)}" inserido!`);
  };

  // Group multiple selected elements
  const handleGroup = useCallback(() => {
    if (selectedIds.length < 2) return;
    const newGroupId = `grp-${Date.now()}`;
    const updated = elements.map((el) => {
      if (selectedIds.includes(el.id)) {
        return { ...el, groupId: newGroupId };
      }
      return el;
    });
    commitElements(updated, true);
    notify(`${selectedIds.length} elementos agrupados com sucesso!`);
  }, [selectedIds, elements, commitElements, notify]);

  // Ungroup selected elements
  const handleUngroup = useCallback(() => {
    if (selectedIds.length === 0) return;
    const updated = elements.map((el) => {
      if (selectedIds.includes(el.id)) {
        const copy = { ...el };
        delete copy.groupId;
        return copy;
      }
      return el;
    });
    commitElements(updated, true);
    notify('Elementos desagrupados!');
  }, [selectedIds, elements, commitElements, notify]);

  // Duplicate selected element(s) with group persistence
  const handleDuplicate = useCallback(() => {
    if (selectedIds.length === 0) return;
    const targets = elements.filter((e) => selectedIds.includes(e.id));
    if (targets.length === 0) return;

    // Create unique new group IDs for duplicated groups
    const groupMapping: Record<string, string> = {};
    targets.forEach((t) => {
      if (t.groupId && !groupMapping[t.groupId]) {
        groupMapping[t.groupId] = `grp-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
      }
    });

    const newElements = targets.map((t, idx) => ({
      ...t,
      id: `copy-${Date.now()}-${idx}`,
      x: t.x + 30,
      y: t.y + 30,
      groupId: t.groupId ? groupMapping[t.groupId] : undefined,
      zIndex: elements.length + idx + 1,
    }));

    commitElements([...elements, ...newElements], true);
    setSelectedIds(newElements.map((e) => e.id));
    notify(`${newElements.length} elemento(s) duplicado(s).`);
  }, [selectedIds, elements, commitElements, notify]);

  // Delete selected element(s)
  const handleDelete = useCallback(() => {
    if (selectedIds.length === 0) return;
    const updated = elements.filter((e) => !selectedIds.includes(e.id));
    commitElements(updated, true);
    setSelectedIds([]);
    notify('Elemento(s) removido(s).');
  }, [selectedIds, elements, commitElements, notify]);

  // Z-Index: Bring to Front
  const handleBringToFront = () => {
    if (selectedIds.length === 0) return;
    const maxZ = Math.max(...elements.map((e) => e.zIndex), 0);
    const updated = elements.map((e, idx) =>
      selectedIds.includes(e.id) ? { ...e, zIndex: maxZ + idx + 1 } : e
    );
    commitElements(updated, true);
  };

  // Z-Index: Send to Back
  const handleSendToBack = () => {
    if (selectedIds.length === 0) return;
    const minZ = Math.min(...elements.map((e) => e.zIndex), 0);
    const updated = elements.map((e, idx) =>
      selectedIds.includes(e.id) ? { ...e, zIndex: minZ - selectedIds.length + idx } : e
    );
    commitElements(updated, true);
  };

  // Style change handler (batch applies to all selected elements)
  const handleChangeStyle = (key: string, value: unknown) => {
    if (selectedIds.length > 0) {
      const updated = elements.map((el) => {
        if (selectedIds.includes(el.id)) {
          return {
            ...el,
            [key]: value,
          };
        }
        return el;
      });
      commitElements(updated, true);
    }

    if (DEFAULT_STYLE_KEYS.has(key)) {
      setDefaultStyles((prev) => ({
        ...prev,
        [key]: value,
      }));
    }
  };

  // Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea') return;

      // Undo / Redo
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
        return;
      }

      // Group (Ctrl+G) / Ungroup (Ctrl+Shift+G)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'g') {
        e.preventDefault();
        if (e.shiftKey) {
          handleUngroup();
        } else {
          handleGroup();
        }
        return;
      }

      // Duplicate (Ctrl+D)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        handleDuplicate();
        return;
      }

      // Delete (Delete / Backspace)
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        handleDelete();
        return;
      }

      // Salvar (Ctrl+S)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        void handleSaveNow();
        return;
      }

      // Export (Ctrl+E)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'e') {
        e.preventDefault();
        setExportOpen(true);
        return;
      }

      // Quick open Component Library Search (/)
      if (e.key === '/' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        setIsLibraryOpen(true);
        setFocusSearchSignal((n) => n + 1);
        return;
      }

      // Tool selection shortcuts
      switch (e.key) {
        case '1':
        case 'v':
        case 'V':
          setActiveTool('select');
          break;
        case '2':
        case 'r':
        case 'R':
          setActiveTool('rectangle');
          break;
        case '3':
        case 'd':
        case 'D':
          if (!e.ctrlKey && !e.metaKey) setActiveTool('diamond');
          break;
        case '4':
        case 'c':
        case 'C':
          setActiveTool('capsule');
          break;
        case '5':
          setActiveTool('cylinder');
          break;
        case 'b':
        case 'B':
          setActiveTool('bezier');
          break;
        case 'm':
        case 'M':
          setActiveTool('path');
          break;
        case '6':
          setActiveTool('parallelogram');
          break;
        case '7':
          setActiveTool('ellipse');
          break;
        case '8':
        case 'a':
        case 'A':
          if (!e.ctrlKey && !e.metaKey) setActiveTool('arrow');
          break;
        case '9':
        case 'l':
        case 'L':
          setActiveTool('line');
          break;
        case 'p':
        case 'P':
          setActiveTool('freedraw');
          break;
        case '0':
        case 't':
        case 'T':
          setActiveTool('text');
          break;
        case 'e':
        case 'E':
          setActiveTool('eraser');
          break;
        case '+':
        case '=':
          handleZoomIn();
          break;
        case '-':
        case '_':
          handleZoomOut();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo, handleDuplicate, handleDelete, handleGroup, handleUngroup, handleSaveNow]);

  const selectedElements = elements.filter((e) => selectedIds.includes(e.id));
  const selectedElement = selectedElements.length === 1 ? selectedElements[0] : null;

  const showSelectionActions = activeTool === 'select' && selectedElements.length > 0;

  // Enquanto o quadro vem do banco, mostra o loader (evita piscar o modelo padrão)
  if (!databaseLoaded) {
    return <EditorLoader />;
  }

  return (
    <main className="w-full h-dvh overflow-hidden bg-base-200 flex flex-col font-sans select-none">
      <Navbar
        title={title}
        saveStatus={saveStatus}
        onSave={handleSaveNow}
        onOpenExport={() => setExportOpen(true)}
        onOpenTemplates={() => setTemplatesOpen(true)}
        onOpenShortcuts={() => setShortcutsOpen(true)}
        onOpenDatabase={() => setDatabaseJsonbOpen(true)}
        onOpenGraphicAssets={() => setGraphicAssetsOpen(true)}
        onClearCanvas={handleClearCanvas}
        elementCount={elements.length}
        isLibraryOpen={isLibraryOpen}
        onToggleLibrary={() => {
          setIsLibraryOpen((v) => !v);
          setIsInspectorOpen(false);
        }}
        isInspectorOpen={isInspectorOpen}
        onToggleInspector={() => {
          setIsInspectorOpen((v) => !v);
          setIsLibraryOpen(false);
        }}
      >
        <Toolbar activeTool={activeTool} onSelectTool={(tool) => setActiveTool(tool)} />
      </Navbar>

      <div className="relative flex-1 min-h-0 flex">
        {/* Coluna esquerda: Design / Camadas */}
        <EditorSidebar
          className={cn(
            'w-72 shrink-0',
            isLibraryOpen
              ? 'flex absolute inset-y-0 left-0 z-30 shadow-xl lg:static lg:shadow-none'
              : 'hidden lg:flex'
          )}
          elements={elements}
          selectedIds={selectedIds}
          onSelectIds={(ids) => {
            setSelectedIds(ids);
            setActiveTool('select');
          }}
          onInsertComponent={handleInsertComponent}
          onInsertAsset={handleInsertGraphicAsset}
          onOpenGraphicAssets={() => setGraphicAssetsOpen(true)}
          onOpenTemplates={() => setTemplatesOpen(true)}
          onOpenHelp={() => setShortcutsOpen(true)}
          focusSearchSignal={focusSearchSignal}
        />

        {/* Coluna central: canvas */}
        <section aria-label="Área de desenho" className="relative flex-1 min-w-0">
          <Canvas
            elements={elements}
            onElementsChange={(newEls, record) => commitElements(newEls, record ?? false)}
            selectedIds={selectedIds}
            onSelectIds={(ids) => setSelectedIds(ids)}
            activeTool={activeTool}
            onToolUsed={() => setActiveTool('select')}
            defaultStyles={defaultStyles}
            viewport={viewport}
            onViewportChange={setViewport}
            gridType={gridType}
            onDropComponent={handleDropComponent}
            smartSnappingEnabled={smartSnapping}
            onResize={setCanvasSize}
          />

          {showSelectionActions && (
            <SelectionActions
              selectedElements={selectedElements}
              viewport={viewport}
              containerSize={canvasSize}
              onBringToFront={handleBringToFront}
              onSendToBack={handleSendToBack}
              onDuplicate={handleDuplicate}
              onDelete={handleDelete}
              onOpenInspector={() => {
                setIsInspectorOpen(true);
                setIsLibraryOpen(false);
              }}
            />
          )}

          <CanvasControls
            canUndo={historyIndex > 0}
            canRedo={historyIndex < history.length - 1}
            onUndo={handleUndo}
            onRedo={handleRedo}
            zoom={viewport.zoom}
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onResetZoom={handleResetZoom}
            gridType={gridType}
            onToggleGrid={handleToggleGrid}
            smartSnapping={smartSnapping}
            onToggleSmartSnapping={() => {
              setSmartSnapping((s) => !s);
              notify(!smartSnapping ? 'Guias inteligentes ativadas!' : 'Guias inteligentes desativadas.');
            }}
            elementCount={elements.length}
          />
        </section>

        {/* Coluna direita: propriedades */}
        <PropertiesPanel
          className={cn(
            'w-80 shrink-0',
            isInspectorOpen
              ? 'flex absolute inset-y-0 right-0 z-30 shadow-xl lg:static lg:shadow-none'
              : 'hidden lg:flex'
          )}
          selectedElement={selectedElement}
          selectedElements={selectedElements}
          defaultStyles={defaultStyles}
          onChangeStyle={handleChangeStyle}
          onDuplicate={handleDuplicate}
          onDelete={handleDelete}
          onBringToFront={handleBringToFront}
          onSendToBack={handleSendToBack}
          onGroup={handleGroup}
          onUngroup={handleUngroup}
        />

        {/* Fundo das gavetas em telas menores */}
        {(isLibraryOpen || isInspectorOpen) && (
          <button
            type="button"
            aria-label="Fechar painel"
            className="lg:hidden absolute inset-0 z-20 bg-base-content/20 cursor-default"
            onClick={() => {
              setIsLibraryOpen(false);
              setIsInspectorOpen(false);
            }}
          />
        )}
      </div>

      {toastMessage && (
        <div className="toast toast-bottom toast-center z-50 mb-16 pointer-events-none">
          <div className="alert alert-soft py-2 px-4 text-sm shadow-md">{toastMessage}</div>
        </div>
      )}

      {/* Modals */}
      <ExportModal
        isOpen={exportOpen}
        onClose={() => setExportOpen(false)}
        elements={elements}
        onNotify={notify}
        onOpenDatabaseJsonb={() => setDatabaseJsonbOpen(true)}
      />

      <DatabaseJsonbModal
        isOpen={databaseJsonbOpen}
        onClose={() => setDatabaseJsonbOpen(false)}
        elements={elements}
        viewport={viewport}
        gridType={gridType}
        onLoadElements={(loadedElements, title) => {
          commitElements(loadedElements, true);
          setSelectedIds([]);
          notify(`Diagrama "${title || 'Importado'}" carregado do banco de dados!`);
        }}
        onNotify={notify}
      />

      <GraphicAssetsModal
        isOpen={graphicAssetsOpen}
        onClose={() => setGraphicAssetsOpen(false)}
        onInsertAsset={handleInsertGraphicAsset}
      />

      <TemplatesModal
        isOpen={templatesOpen}
        onClose={() => setTemplatesOpen(false)}
        onLoadTemplate={handleLoadTemplate}
      />

      <ShortcutsModal
        isOpen={shortcutsOpen}
        onClose={() => setShortcutsOpen(false)}
      />

    </main>
  );
}
