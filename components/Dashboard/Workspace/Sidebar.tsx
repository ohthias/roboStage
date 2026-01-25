import React, { useState, useMemo } from 'react';
import {
  Plus,
  Trash2,
  ChevronRight,
  ChevronDown
} from 'lucide-react';

export interface Page {
  id: string;
  parentId: string | null;
  title: string;
  icon: string;
  content?: string;
  expanded?: boolean;
}

interface SidebarProps {
  pages: Page[];
  activePageId: string;
  onSelectPage: (id: string) => void;
  onAddPage: (parentId: string | null) => void;
  onDeletePage: (id: string) => void;
  onToggleExpand: (id: string) => void;
  onMovePage: (
    draggedId: string,
    targetId: string,
    position: 'before' | 'after' | 'inside'
  ) => void;
}

/* ===========================
   Sidebar Item (Recursivo)
=========================== */

const SidebarItem = ({
  page,
  allPages,
  level,
  activePageId,
  isCollapsed,
  onSelectPage,
  onAddPage,
  onDeletePage,
  onToggleExpand,
  onMovePage,
  dropTarget,
  setDropTarget
}: any) => {
  const children = useMemo(
    () => allPages.filter((p: Page) => p.parentId === page.id),
    [allPages, page.id]
  );

  const hasChildren = children.length > 0;
  const isExpanded = page.expanded ?? false;
  const isActive = activePageId === page.id;

  /* Drag & Drop */
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData(
      'application/json',
      JSON.stringify({ id: page.id })
    );
    e.stopPropagation();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const rect = e.currentTarget.getBoundingClientRect();
    const offset = e.clientY - rect.top;

    let position: 'before' | 'after' | 'inside' = 'inside';
    if (offset < rect.height * 0.25) position = 'before';
    else if (offset > rect.height * 0.75) position = 'after';

    setDropTarget({ id: page.id, position });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const data = e.dataTransfer.getData('application/json');
    if (!data) return;

    const { id } = JSON.parse(data);
    if (id !== page.id && dropTarget) {
      onMovePage(id, page.id, dropTarget.position);
    }
    setDropTarget(null);
  };

  const isDrop = dropTarget?.id === page.id;

  return (
    <div>
      <div
        draggable
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => onSelectPage(page.id)}
        className={`
          group relative flex items-center
          ${isCollapsed ? 'justify-center' : 'gap-1'}
          px-3 py-1 min-h-[28px]
          text-sm cursor-pointer rounded
          transition-all duration-200
          ${
            isActive
              ? 'bg-[#EFEFEF] text-[#37352f]'
              : 'text-[#5F5E5B] hover:bg-[#EFEFEF]'
          }
        `}
        style={{
          paddingLeft: isCollapsed ? undefined : `${level * 12 + 12}px`
        }}
      >
        {/* Highlight lateral */}
        {isActive && (
          <span className="absolute left-0 top-1 bottom-1 w-[3px] bg-[#37352f] rounded-r" />
        )}

        {/* Drop indicators */}
        {isDrop && dropTarget.position === 'before' && (
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-blue-400" />
        )}
        {isDrop && dropTarget.position === 'after' && (
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-blue-400" />
        )}

        {/* Expand */}
        {!isCollapsed && (
          <div
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand(page.id);
            }}
            className="w-5 h-5 flex items-center justify-center text-gray-400 hover:bg-black/5 rounded"
          >
            {hasChildren ? (
              isExpanded ? (
                <ChevronDown size={14} />
              ) : (
                <ChevronRight size={14} />
              )
            ) : (
              <div className="w-1 h-1 bg-gray-300 rounded-full" />
            )}
          </div>
        )}

        {/* Icon */}
        <span className="text-base min-w-[20px] text-center">
          {page.icon || '📄'}
        </span>

        {/* Title */}
        {!isCollapsed && (
          <span className="truncate flex-1">{page.title}</span>
        )}

        {/* Actions */}
        {!isCollapsed && (
          <div className="absolute right-2 flex opacity-0 group-hover:opacity-100 bg-[#EFEFEF] rounded shadow">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeletePage(page.id);
              }}
              className="p-1 hover:bg-[#D9D9D7]"
            >
              <Trash2 size={12} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddPage(page.id);
                if (!isExpanded) onToggleExpand(page.id);
              }}
              className="p-1 hover:bg-[#D9D9D7]"
            >
              <Plus size={12} />
            </button>
          </div>
        )}

        {/* Tooltip */}
        {isCollapsed && (
          <div className="absolute left-full ml-2 opacity-0 group-hover:opacity-100 transition pointer-events-none z-50">
            <div className="bg-[#37352f] text-white text-xs px-2 py-1 rounded shadow">
              {page.title}
            </div>
          </div>
        )}
      </div>

      {/* Children */}
      {isExpanded &&
        children.map((child: Page) => (
          <SidebarItem
            key={child.id}
            page={child}
            allPages={allPages}
            level={level + 1}
            activePageId={activePageId}
            isCollapsed={isCollapsed}
            onSelectPage={onSelectPage}
            onAddPage={onAddPage}
            onDeletePage={onDeletePage}
            onToggleExpand={onToggleExpand}
            onMovePage={onMovePage}
            dropTarget={dropTarget}
            setDropTarget={setDropTarget}
          />
        ))}
    </div>
  );
};

/* ===========================
   Sidebar Principal
=========================== */

export default function Sidebar({
  pages,
  activePageId,
  onSelectPage,
  onAddPage,
  onDeletePage,
  onToggleExpand,
  onMovePage
}: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [dropTarget, setDropTarget] = useState<any>(null);

  const rootPages = useMemo(
    () => pages.filter((p) => !p.parentId),
    [pages]
  );

  return (
    <div
      className={`
        ${isCollapsed ? 'w-16' : 'w-64'}
        bg-[#F7F7F5] border-r border-[#E9E9E7]
        flex flex-col h-screen
        transition-all duration-300
        select-none
      `}
    >
      {/* Collapse Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="mx-2 mb-1 p-2 rounded hover:bg-[#EFEFEF]"
      >
        <ChevronRight
          size={16}
          className={`transition-transform ${
            isCollapsed ? '' : 'rotate-180'
          }`}
        />
      </button>

      {/* Pages */}
      <div className="flex-1 overflow-y-auto px-2">
        {!isCollapsed && (
          <div className="flex justify-between px-3 py-1 text-xs text-gray-400 uppercase">
            Privado
            <button onClick={() => onAddPage(null)}>
              <Plus size={14} />
            </button>
          </div>
        )}

        {rootPages.map((page) => (
          <SidebarItem
            key={page.id}
            page={page}
            allPages={pages}
            level={0}
            activePageId={activePageId}
            isCollapsed={isCollapsed}
            onSelectPage={onSelectPage}
            onAddPage={onAddPage}
            onDeletePage={onDeletePage}
            onToggleExpand={onToggleExpand}
            onMovePage={onMovePage}
            dropTarget={dropTarget}
            setDropTarget={setDropTarget}
          />
        ))}
      </div>

      {/* Bottom */}
      <div
        onClick={() => onAddPage(null)}
        className="p-3 border-t border-[#E9E9E7] hover:bg-[#EFEFEF] flex gap-2 items-center cursor-pointer"
      >
        <Plus size={16} />
        {!isCollapsed && <span>Nova Página</span>}
      </div>
    </div>
  );
}