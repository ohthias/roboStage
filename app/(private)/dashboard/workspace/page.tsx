'use client';
import { INITIAL_DOCUMENTS } from '@/components/Dashboard/Workspace/constants';
import { Editor } from '@/components/Dashboard/Workspace/Editor';
import { SearchModal } from '@/components/Dashboard/Workspace/SearchModal';
import { Sidebar } from '@/components/Dashboard/Workspace/Sidebar';
import { DocumentMap, Template, Document } from '@/components/Dashboard/Workspace/types';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';

const App: React.FC = () => {
  const [documents, setDocuments] = useState<DocumentMap>(() => {
    const saved = localStorage.getItem('nexus_docs');
    return saved ? JSON.parse(saved) : INITIAL_DOCUMENTS;
  });
  
  const [activeId, setActiveId] = useState<string | null>(() => {
    const saved = localStorage.getItem('nexus_active_id');
    return saved || (Object.keys(INITIAL_DOCUMENTS)[0] || null);
  });

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [filterTag, setFilterTag] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('nexus_docs', JSON.stringify(documents));
  }, [documents]);

  useEffect(() => {
    if (activeId) {
      localStorage.setItem('nexus_active_id', activeId);
    }
  }, [activeId]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleAddDocument = useCallback((parentId: string | null, template?: Template) => {
    const id = uuidv4();
    const newDoc: Document = {
      id,
      title: template?.title || "New Page",
      content: template?.content || "",
      tags: template?.tags || [],
      icon: template?.icon || "📄",
      parentId,
      isExpanded: true,
      createdAt: Date.now()
    };

    setDocuments(prev => {
      const next = { ...prev, [id]: newDoc };
      if (parentId && next[parentId]) {
        next[parentId] = { ...next[parentId], isExpanded: true };
      }
      return next;
    });
    setActiveId(id);
  }, []);

  const handleDeleteDocument = useCallback((id: string) => {
    setDocuments(prev => {
      const next = { ...prev };
      const deleteRecursive = (docId: string) => {
        (Object.values(next) as unknown as Document[]).forEach(d => {
          if (d.parentId === docId) deleteRecursive(d.id);
        });
        delete next[docId];
      };
      
      deleteRecursive(id);
      return next;
    });

    if (activeId === id) {
      setActiveId(null);
    }
  }, [activeId]);

  const handleUpdateDocument = useCallback((id: string, updates: Partial<Document>) => {
    setDocuments(prev => {
      if (!prev[id]) return prev;
      return {
        ...prev,
        [id]: { ...prev[id], ...updates }
      };
    });
  }, []);

  const handleToggleExpand = useCallback((id: string) => {
    setDocuments(prev => {
      if (!prev[id]) return prev;
      return {
        ...prev,
        [id]: { ...prev[id], isExpanded: !prev[id].isExpanded }
      };
    });
  }, []);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    Object.values(documents).forEach(doc => {
      doc.tags?.forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [documents]);

  const activeDoc = activeId ? documents[activeId] : null;

  return (
    <div className="flex h-full w-full overflow-hidden">
      <Sidebar 
        documents={documents}
        activeId={activeId}
        onSelect={setActiveId}
        onAdd={handleAddDocument}
        onDelete={handleDeleteDocument}
        onToggleExpand={handleToggleExpand}
        onOpenSearch={() => setIsSearchOpen(true)}
        tags={allTags}
        filterTag={filterTag}
        onFilterTag={setFilterTag}
      />
      
      <main className="flex-1 overflow-hidden">

      </main>

      <SearchModal 
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        documents={documents}
        onSelect={setActiveId}
      />
    </div>
  );
};

export default App;
