import React from 'react';
import { Plus, Trash2, FileText, ChevronRight } from 'lucide-react';

export interface Page {
  id: string;
  title: string;
  icon: string;
  content?: string;
}

interface SidebarProps {
  pages: Page[];
  activePageId: string;
  onSelectPage: (id: string) => void;
  onAddPage: () => void;
  onDeletePage: (id: string) => void;
}

export default function Sidebar({ pages, activePageId, onSelectPage, onAddPage, onDeletePage }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  return (
    <div className={`flex ${isCollapsed ? 'w-16' : 'w-64'} bg-base-200 border-r border-base-300 flex-col h-[calc(100vh-64px)] flex-shrink-0 transition-all select-none group/sidebar`}>
      <button onClick={() => setIsCollapsed(!isCollapsed)} className="p-2">
        {isCollapsed ? <ChevronRight size={16} /> : <ChevronRight size={16} className="transform rotate-180" />}
      </button>
      {/* Pages List */}
      <div className="flex-1 overflow-y-auto px-2 py-2">
        <div className="flex items-center justify-between px-3 py-1 mb-1 group/header">
           <div className={`text-xs font-semibold text-base-content ${isCollapsed ? 'hidden' : ''}`}>PRIVATE</div>
           <button onClick={onAddPage} className="opacity-0 group-hover/header:opacity-100 text-base-content/80 hover:text-base-content transition-opacity">
             <Plus size={14} />
           </button>
        </div>
        
        <div className="space-y-0.5">
          {pages.map((page) => (
            <div
              key={page.id}
              className={`group flex items-center gap-2 px-3 py-1 min-h-[28px] text-sm rounded transition-colors relative cursor-pointer ${
                activePageId === page.id 
                  ? "bg-base-300 font-medium text-base-content" 
                  : "text-base-content/70 hover:bg-base-300/50"
              }`}
              onClick={() => onSelectPage(page.id)}
            >
              <span className={`text-base min-w-[20px] text-center ${isCollapsed ? 'hidden' : ''}`}>{page.icon || "📄"}</span>
              <span className={`truncate flex-1 ${isCollapsed ? 'hidden' : ''}`}>{page.title || "Untitled"}</span>
              
              {pages.length > 1 && (
                <button
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-base-300 rounded text-base-content/60 absolute right-2 transition-opacity"
                  onClick={(e) => { e.stopPropagation(); onDeletePage(page.id); }}
                >
                  <Trash2 size={12} />
                </button>
              )}
            </div>
          ))}
        </div>
        
        {pages.length === 0 && (
          <div className="px-4 py-8 text-center text-xs text-base-content/40">
             No pages created.
          </div>
        )}
      </div>

      {/* Bottom Action */}
      <div
        onClick={onAddPage}
        className="p-3 border-t border-base-300 text-base-content/70 hover:text-base-content hover:bg-base-300/50 cursor-pointer flex items-center gap-3 text-sm transition-colors"
      >
        <Plus size={16} />
        <span className={`${isCollapsed ? 'hidden' : ''}`}>New Page</span>
      </div>
    </div>
  );
}