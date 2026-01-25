'use client';
import TextEditor from '@/components/Dashboard/Workspace/Editor/TextEditor';
import Sidebar, { Page } from '@/components/Dashboard/Workspace/Sidebar';
import React, { useState, useEffect } from 'react';

// Initial dummy data with expanded property for hierarchy
const INITIAL_PAGES: Page[] = [
  { 
    id: '1', 
    parentId: null,
    title: 'Getting Started', 
    icon: '👋', 
    content: undefined,
    expanded: true
  },
  { 
    id: '2', 
    parentId: null,
    title: 'Engineering Notes', 
    icon: '🛠️', 
    content: undefined,
    expanded: false 
  }
];

export default function App() {
  const [pages, setPages] = useState<Page[]>(() => {
    try {
      const saved = localStorage.getItem('robostage-pages');
      const parsed = saved ? JSON.parse(saved) : INITIAL_PAGES;
      return parsed.map((p: any) => ({ ...p, parentId: p.parentId ?? null, expanded: p.expanded ?? false }));
    } catch {
      return INITIAL_PAGES;
    }
  });
  
  const [activePageId, setActivePageId] = useState<string>(() => pages[0]?.id || '1');

  useEffect(() => {
    localStorage.setItem('robostage-pages', JSON.stringify(pages));
  }, [pages]);

  const activePage = pages.find(p => p.id === activePageId) || pages[0];

  const handleAddPage = (parentId: string | null = null) => {
    const newPage: Page = {
      id: Date.now().toString(),
      parentId: parentId,
      title: '',
      icon: '📄',
      content: undefined,
      expanded: true
    };
    setPages(prev => [...prev, newPage]);
    setActivePageId(newPage.id);
    
    if (parentId) {
      setPages(prev => prev.map(p => p.id === parentId ? { ...p, expanded: true } : p));
    }
  };

  const handleDeletePage = (id: string) => {
    const getDescendants = (pageId: string, allPages: Page[]): string[] => {
      const children = allPages.filter(p => p.parentId === pageId);
      let descendants = children.map(c => c.id);
      children.forEach(child => {
        descendants = [...descendants, ...getDescendants(child.id, allPages)];
      });
      return descendants;
    };

    const idsToDelete = [id, ...getDescendants(id, pages)];
    const newPages = pages.filter(p => !idsToDelete.includes(p.id));
    
    setPages(newPages);

    if (idsToDelete.includes(activePageId)) {
       const deletedPage = pages.find(p => p.id === id);
       if (deletedPage && deletedPage.parentId) {
         setActivePageId(deletedPage.parentId);
       } else if (newPages.length > 0) {
         setActivePageId(newPages[newPages.length - 1].id);
       }
    }
  };

  const handleUpdatePage = (id: string, updates: Partial<Page>) => {
    setPages(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const handleToggleExpand = (id: string) => {
    setPages(prev => prev.map(p => p.id === id ? { ...p, expanded: !p.expanded } : p));
  };

  // Move page logic for Drag and Drop
  const handleMovePage = (draggedId: string, targetId: string, position: 'before' | 'after' | 'inside') => {
    if (draggedId === targetId) return;

    // Cycle detection: Cannot move a parent into its own child
    const isDescendant = (potentialAncestorId: string, potentialDescendantId: string): boolean => {
       const child = pages.find(p => p.id === potentialDescendantId);
       if (!child || !child.parentId) return false;
       if (child.parentId === potentialAncestorId) return true;
       return isDescendant(potentialAncestorId, child.parentId);
    };

    if (isDescendant(draggedId, targetId)) {
      console.warn("Cannot move a page into its own descendant");
      return;
    }

    setPages(prev => {
      const draggedPage = prev.find(p => p.id === draggedId);
      const targetPage = prev.find(p => p.id === targetId);
      if (!draggedPage || !targetPage) return prev;

      let newParentId = draggedPage.parentId;
      let newPages = prev.filter(p => p.id !== draggedId); // Remove dragged page first
      
      if (position === 'inside') {
        newParentId = targetId;
        newPages.push({ ...draggedPage, parentId: newParentId });
        
        newPages = newPages.map(p => p.id === targetId ? { ...p, expanded: true } : p);

      } else {
        newParentId = targetPage.parentId;
        const targetIndex = newPages.findIndex(p => p.id === targetId);
        
        const insertionIndex = position === 'before' ? targetIndex : targetIndex + 1;
        
        const updatedDraggedPage = { ...draggedPage, parentId: newParentId };
        
        newPages.splice(insertionIndex, 0, updatedDraggedPage);
      }

      return newPages;
    });
  };

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden">
      <Sidebar 
        pages={pages}
        activePageId={activePageId}
        onSelectPage={setActivePageId}
        onAddPage={handleAddPage}
        onDeletePage={handleDeletePage}
        onToggleExpand={handleToggleExpand}
        onMovePage={handleMovePage}
      />
      
      <div className="flex-1 flex flex-col min-w-0 bg-white">
        {activePage ? (
          <>
            <main className="flex-1 overflow-y-auto relative scroll-smooth">
              <div key={activePage.id} className="contents">
                <TextEditor 
                  initialTitle={activePage.title}
                  initialIcon={activePage.icon}
                  initialContent={activePage.content}
                  onUpdate={(data) => handleUpdatePage(activePage.id, data)}
                />
              </div>
            </main>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            Sem pagina ativa. Crie ou selecione uma página na barra lateral.
          </div>
        )}
      </div>
    </div>
  );
}