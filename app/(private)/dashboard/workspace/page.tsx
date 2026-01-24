'use client';
import Sidebar, { Page } from '@/components/Dashboard/Workspace/Sidebar';
import TextEditor from '@/components/Editor/TextEditor';
import React, { useState, useEffect } from 'react';
const INITIAL_PAGES: Page[] = [
  { 
    id: '1', 
    title: 'Getting Started', 
    icon: '👋', 
    content: undefined 
  },
  { 
    id: '2', 
    title: 'Engineering Notes', 
    icon: '🛠️', 
    content: undefined 
  }
];

export default function App() {
  const [pages, setPages] = useState<Page[]>(() => {
    try {
      const saved = localStorage.getItem('robostage-pages');
      return saved ? JSON.parse(saved) : INITIAL_PAGES;
    } catch {
      return INITIAL_PAGES;
    }
  });
  
  const [activePageId, setActivePageId] = useState<string>(() => pages[0]?.id || '1');
  useEffect(() => {
    localStorage.setItem('robostage-pages', JSON.stringify(pages));
  }, [pages]);

  const activePage = pages.find(p => p.id === activePageId) || pages[0];

  const handleAddPage = () => {
    const newPage: Page = {
      id: Date.now().toString(),
      title: '',
      icon: '📄',
      content: undefined
    };
    setPages(prev => [...prev, newPage]);
    setActivePageId(newPage.id);
  };

  const handleDeletePage = (id: string) => {
    const newPages = pages.filter(p => p.id !== id);
    setPages(newPages);
    if (activePageId === id && newPages.length > 0) {
      setActivePageId(newPages[newPages.length - 1].id);
    }
  };

  const handleUpdatePage = (id: string, updates: Partial<Page>) => {
    setPages(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden font-sans">
      <Sidebar 
        pages={pages}
        activePageId={activePageId}
        onSelectPage={setActivePageId}
        onAddPage={handleAddPage}
        onDeletePage={handleDeletePage}
      />
      
      <div className="flex-1 flex flex-col min-w-0 bg-white">
        {activePage ? (
          <>
            <main className="flex-1 overflow-y-auto relative scroll-smooth">
              <TextEditor 
                key={activePage.id}
                initialTitle={activePage.title}
                initialIcon={activePage.icon}
                initialContent={activePage.content}
                onUpdate={(data) => handleUpdatePage(activePage.id, data)}
              />
            </main>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            No page selected
          </div>
        )}
      </div>
    </div>
  );
}