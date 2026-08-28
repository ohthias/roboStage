import React, { useState } from 'react';
import {
  X,
  FolderPlus,
  Factory,
  Code,
  Users,
  ShoppingBag,
  Activity,
  Truck,
  Check,
} from 'lucide-react';
import { ISHIKAWA_TEMPLATES } from '@/utils/thinklab/templates';
import { TemplateItem } from '@/app/(public)/[competicao]/thinklab/ishikawa/ishikawa.types';

interface TemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (markdown: string) => void;
}

export const TemplateModal: React.FC<TemplateModalProps> = ({
  isOpen,
  onClose,
  onSelectTemplate,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  if (!isOpen) return null;

  const filteredTemplates = ISHIKAWA_TEMPLATES.filter((t) => {
    if (selectedFilter === 'all') return true;
    return t.categoryType === selectedFilter;
  });

  const getTemplateIcon = (name: string) => {
    switch (name) {
      case 'Factory':
        return <Factory className="w-5 h-5 text-primary" />;
      case 'Code':
        return <Code className="w-5 h-5 text-success" />;
      case 'Users':
        return <Users className="w-5 h-5 text-secondary" />;
      case 'ShoppingBag':
        return <ShoppingBag className="w-5 h-5 text-warning" />;
      case 'Activity':
        return <Activity className="w-5 h-5 text-error" />;
      case 'Truck':
        return <Truck className="w-5 h-5 text-info" />;
      default:
        return <FolderPlus className="w-5 h-5 text-primary" />;
    }
  };

  const handleApply = (template: TemplateItem) => {
    onSelectTemplate(template.markdown);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-base-100 rounded-3xl shadow-2xl border-2 border-base-content/20 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b-2 border-base-content/10 flex items-center justify-between bg-base-200/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary text-primary-content border-2 border-base-content/20 flex items-center justify-center shadow-md">
              <FolderPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-base-content">
                Modelos de Diagrama Ishikawa
              </h2>
              <p className="text-xs font-medium opacity-60">
                Selecione uma estrutura comprovada para o seu setor
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="btn btn-sm btn-ghost btn-square border border-base-content/20"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filter Tabs with daisyUI */}
        <div className="px-6 py-3 border-b border-base-content/10 flex items-center gap-2 bg-base-200/30 overflow-x-auto">
          {[
            { id: 'all', label: 'Todos os Modelos' },
            { id: '6M', label: 'Indústria (6M)' },
            { id: '4P', label: 'Serviços (4P)' },
            { id: '4S', label: 'Software & TI (4S)' },
            { id: 'Custom', label: 'Personalizados' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedFilter(tab.id)}
              className={`btn btn-xs sm:btn-sm font-bold ${
                selectedFilter === tab.id ? 'btn-primary shadow-sm' : 'btn-ghost'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Grid of Templates daisyUI Cards */}
        <div className="p-6 overflow-y-auto space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTemplates.map((template) => (
              <div
                key={template.id}
                className="card bg-base-200/60 hover:bg-base-200 border-2 border-base-content/10 hover:border-primary/50 shadow-md transition-all flex flex-col justify-between p-4 rounded-2xl"
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-base-100 border border-base-content/10">
                        {getTemplateIcon(template.iconName)}
                      </div>
                      <div>
                        <h3 className="font-extrabold text-sm text-base-content">
                          {template.title}
                        </h3>
                        <p className="text-[11px] font-medium opacity-60">
                          {template.subtitle}
                        </p>
                      </div>
                    </div>
                    <span className="badge badge-sm badge-outline font-bold">
                      {template.categoryType}
                    </span>
                  </div>

                  <p className="text-xs opacity-75 line-clamp-2">
                    {template.description}
                  </p>
                </div>

                <div className="pt-3 mt-3 border-t border-base-content/10 flex items-center justify-end">
                  <button
                    onClick={() => handleApply(template)}
                    className="btn btn-xs sm:btn-sm btn-primary gap-1 font-bold"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Usar Modelo</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t-2 border-base-content/10 bg-base-200/50 flex justify-end">
          <button onClick={onClose} className="btn btn-sm btn-ghost font-bold">
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
