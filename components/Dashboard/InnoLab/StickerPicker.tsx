
import React, { useState } from 'react';
import { Smile, X, Upload, Search, Image as ImageIcon, LayoutGrid } from 'lucide-react';
import { STICKER_PACKS } from '@/app/(private)/innolab/[id]/[diagram_type]/constants';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (content: string, type: 'emoji' | 'image') => void;
}

const StickerPicker: React.FC<Props> = ({ isOpen, onClose, onSelect }) => {
  const [activeCategory, setActiveCategory] = useState<keyof typeof STICKER_PACKS>("Fluxo / Operações");
  const [searchQuery, setSearchQuery] = useState("");

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        onSelect(base64, 'image');
        onClose();
      };
      reader.readAsDataURL(file);
    }
  };

  const categories = Object.keys(STICKER_PACKS) as (keyof typeof STICKER_PACKS)[];
  
  // Filter categories
  const filteredCategories = categories.filter(cat => 
    cat.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // If the active category is filtered out, switch to the first available one, or keep current if visible
  const currentCategory = filteredCategories.includes(activeCategory) 
    ? activeCategory 
    : (filteredCategories.length > 0 ? filteredCategories[0] : null);

  return (
    <div className="modal modal-open">
  <div className="modal-box w-[600px] max-w-[600px] h-[550px] p-0 rounded-3xl shadow-2xl bg-base-100/70 backdrop-blur-xl border border-base-200 overflow-hidden flex flex-col">

    {/* HEADER */}
    <div className="flex items-center justify-between p-4 border-b border-base-300 bg-base-100/70">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/20 text-primary rounded-xl shadow-sm">
          <Smile size={20} />
        </div>
        <div>
          <h2 className="font-bold text-base-content text-base">Biblioteca de Adesivos</h2>
          <p className="text-[10px] text-base-content/50 font-semibold uppercase tracking-wide">Selecionar ou Enviar</p>
        </div>
      </div>

      <button onClick={onClose} className="btn btn-sm btn-ghost rounded-full text-base-content/50 hover:text-base-content">
        <X size={18} />
      </button>
    </div>

    <div className="flex flex-1 overflow-hidden">

      {/* SIDEBAR */}
      <aside className="w-48 bg-base-200/50 border-r border-base-300 flex flex-col">

        {/* BUSCA */}
        <div className="p-3">
          <label className="input input-bordered input-sm flex items-center gap-2 rounded-xl bg-base-100">
            <Search size={14} className="opacity-50" />
            <input
              type="text"
              placeholder="Buscar..."
              className="grow text-xs"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </label>
        </div>

        {/* CATEGORIAS */}
        <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-1">

          <div className="px-2 py-1 text-[10px] font-bold text-base-content/50 uppercase tracking-wider">
            Categorias
          </div>

          <ul className="menu menu-sm bg-transparent p-0 space-y-1 w-full">
            {filteredCategories.map(cat => (
              <li key={cat}>
                <button
                  onClick={() => setActiveCategory(cat)}
                  className={`rounded-xl px-3 py-2 flex justify-between items-center ${
                    currentCategory === cat
                      ? "bg-base-100 shadow-sm text-primary font-semibold"
                      : "hover:bg-base-100/40 text-base-content/70"
                  }`}
                >
                  {cat}
                </button>
              </li>
            ))}
          </ul>

          {filteredCategories.length === 0 && (
            <div className="text-center p-4 text-xs text-base-content/40">
              Categoria não encontrada
            </div>
          )}
        </div>
      </aside>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="flex-1 bg-base-100/40 flex flex-col">

        <div className="flex-1 overflow-y-auto p-6">

          {currentCategory ? (
            <div className="animate-fade-in">

              {/* HEADER CATEGORY */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-base-content">{currentCategory}</h3>
                <span className="badge badge-sm badge-outline">
                  {STICKER_PACKS[currentCategory]?.length || 0} items
                </span>
              </div>

              {/* GRID DE STICKERS */}
              <div className="grid grid-cols-6 gap-3">
                {STICKER_PACKS[currentCategory]?.map((sticker, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      onSelect(sticker, "emoji");
                      onClose();
                    }}
                    className="aspect-square flex items-center justify-center text-3xl 
                    bg-base-100 border border-base-200 rounded-2xl shadow hover:shadow-lg
                    hover:scale-110 hover:-translate-y-1 transition-all cursor-pointer active:scale-95"
                  >
                    {sticker}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-base-content/40">
              <LayoutGrid size={48} className="mb-4 opacity-20" />
              <p className="text-sm font-medium">Selecione uma categoria para ver os adesivos</p>
            </div>
          )}
        </div>

        {/* RODAPÉ UPLOAD */}
        <div className="p-4 bg-base-100/60 border-t border-base-300">

          <label className="cursor-pointer flex items-center gap-4 p-3 rounded-2xl border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-all">
            <div className="w-10 h-10 rounded-xl bg-base-100 flex items-center justify-center text-primary shadow-sm group-hover:scale-110 transition-transform">
              <Upload size={20} />
            </div>

            <div className="flex-1">
              <h4 className="text-sm font-bold text-primary">Upload Imagem Personalizada</h4>
              <p className="text-xs text-primary/70">Suporta PNG, JPG, GIF</p>
            </div>

            <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
          </label>

        </div>
      </main>

    </div>
  </div>
</div>
  );
};

export default StickerPicker;
