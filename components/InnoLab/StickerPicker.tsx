
import React, { useState } from 'react';
import { Smile, X, Upload, Search, Image as ImageIcon, LayoutGrid } from 'lucide-react';
import { STICKER_PACKS } from '@/app/(private)/dashboard/innolab/constants';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (content: string, type: 'emoji' | 'image') => void;
}

const StickerPicker: React.FC<Props> = ({ isOpen, onClose, onSelect }) => {
  const [activeCategory, setActiveCategory] = useState<keyof typeof STICKER_PACKS>("Flowchart");
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/20 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Modal Container */}
      <div className="bg-white/80 backdrop-blur-xl w-[600px] h-[550px] rounded-3xl shadow-2xl border border-white/50 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200/50 bg-white/40">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl shadow-sm">
               <Smile size={20} />
            </div>
            <div>
                <h2 className="font-bold text-slate-800 text-base">Sticker Library</h2>
                <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">Select or Upload</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
            
            {/* Sidebar (Categories & Search) */}
            <div className="w-48 bg-slate-50/50 border-r border-slate-200/50 flex flex-col">
                <div className="p-3">
                    <div className="relative group">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                        <input 
                            type="text" 
                            placeholder="Search..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all placeholder:text-slate-400"
                        />
                    </div>
                </div>
                
                <div className="flex-1 overflow-y-auto custom-scrollbar px-2 pb-2 space-y-1">
                    <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Categories</div>
                    {filteredCategories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-between group ${
                                currentCategory === cat 
                                ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200' 
                                : 'text-slate-500 hover:bg-white/50 hover:text-slate-700'
                            }`}
                        >
                            {cat}
                            {currentCategory === cat && <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />}
                        </button>
                    ))}
                    {filteredCategories.length === 0 && (
                        <div className="text-center p-4 text-xs text-slate-400">No categories found</div>
                    )}
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col bg-white/20 relative">
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                    {currentCategory ? (
                        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold text-slate-700">{currentCategory}</h3>
                                <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-1 rounded-lg border border-slate-200">
                                    {STICKER_PACKS[currentCategory]?.length || 0} items
                                </span>
                            </div>
                            
                            <div className="grid grid-cols-6 gap-3">
                                {STICKER_PACKS[currentCategory]?.map((sticker, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => { onSelect(sticker, 'emoji'); onClose(); }}
                                        className="aspect-square flex items-center justify-center text-3xl bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md hover:scale-110 hover:-translate-y-1 hover:border-indigo-200 transition-all cursor-pointer active:scale-95"
                                    >
                                        {sticker}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400">
                            <LayoutGrid size={48} className="mb-4 opacity-20" />
                            <p className="text-sm font-medium">Select a category to view stickers</p>
                        </div>
                    )}
                </div>

                {/* Upload Footer */}
                <div className="p-4 bg-white/60 border-t border-slate-100 backdrop-blur-md">
                    <label className="flex items-center gap-4 p-3 bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100 hover:border-indigo-200 rounded-2xl cursor-pointer transition-all group hover:shadow-sm active:scale-95">
                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-indigo-600 shadow-sm group-hover:scale-110 transition-transform">
                            <Upload size={20} />
                        </div>
                        <div className="flex-1">
                            <h4 className="text-sm font-bold text-indigo-900">Upload Custom Image</h4>
                            <p className="text-xs text-indigo-600/70">Support PNG, JPG, GIF</p>
                        </div>
                        <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                    </label>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default StickerPicker;
