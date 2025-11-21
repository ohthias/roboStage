import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MenuCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  onClick: () => void;
  color: string; // e.g. 'bg-red-500'
}

export const MenuCard: React.FC<MenuCardProps> = ({ title, description, icon: Icon, onClick, color }) => {
  return (
    <button 
      onClick={onClick}
      className="group relative overflow-hidden rounded-2xl bg-base-300 p-8 text-left transition-all hover:-translate-y-1 hover:shadow-2xl border border-base-200 hover:border-base-200 w-full max-w-sm"
    >
      <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity`}>
        <Icon size={120} />
      </div>

      <div className={`inline-flex p-3 rounded-lg bg-opacity-20 mb-4 bg-${color} text-white`}>
        <Icon size={32} />
      </div>

      <h3 className={`text-2xl font-bold mb-2 text-${color}`}>{title}</h3>
      <p className="text-base-content/75">{description}</p>
      
      <div className={`absolute bottom-0 left-0 h-1 w-0 bg-${color} group-hover:w-full transition-all duration-300`} />
    </button>
  );
};