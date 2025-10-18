import React from 'react';
import { Risco } from '@/types/MatrizRisco';
import { getRiskTextColor } from '@/app/(public)/quickbrick/matriz-de-risco/constants';

interface RiscoCardProps {
  risco: Risco;
  onEdit: (risco: Risco) => void;
  onRemove: (riskId: number) => void;
  onView: (risco: Risco) => void;
}

const RiscoCard: React.FC<RiscoCardProps> = ({ risco, onEdit, onRemove, onView }) => {
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData('riskId', risco.id.toString());
  };

  const handleEdit = (e: React.MouseEvent) => {
      e.stopPropagation();
      onEdit(risco);
  }

  const handleRemove = (e: React.MouseEvent) => {
      e.stopPropagation();
      onRemove(risco.id);
  }
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault(); // Prevent space from scrolling the page
      onView(risco);
    }
  };


  return (
    <div
      draggable
      onClick={() => onView(risco)}
      onKeyDown={handleKeyDown}
      onDragStart={handleDragStart}
      className={`p-2 my-1 group rounded-md shadow-sm cursor-grab active:cursor-grabbing border relative ${getRiskTextColor(risco.impacto, risco.probabilidade)} bg-white/80 backdrop-blur-sm hover:shadow-md transition-shadow focus:outline-none focus:ring-2 focus:ring-blue-500`}
      role="button"
      tabIndex={0}
      aria-label={`Ver detalhes de ${risco.titulo}`}
    >
      <p className="font-semibold text-sm leading-tight pr-8">{risco.titulo}</p>
      <div className="absolute top-1 right-1 flex flex-col opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
        <button onClick={handleEdit} aria-label={`Editar risco: ${risco.titulo}`} className="p-1 rounded-full text-gray-500 hover:bg-gray-200 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L16.732 3.732z" /></svg>
        </button>
        <button onClick={handleRemove} aria-label={`Remover risco: ${risco.titulo}`} className="p-1 rounded-full text-red-500 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
        </button>
      </div>
    </div>
  );
};

export default RiscoCard;