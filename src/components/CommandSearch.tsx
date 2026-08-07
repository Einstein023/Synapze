import React, { useState, useEffect, useRef } from 'react';
import { useGarden } from '../lib/gardenState';
import { Search, Compass, BookOpen, Settings, Bot, X, Sparkles, CheckCircle2, FileText } from 'lucide-react';

interface CommandSearchProps {
  onNavigate: (view: 'dashboard' | 'editor' | 'companion' | 'capture' | 'vault' | 'settings') => void;
  onSelectSeedling: (id: string) => void;
  onClose: () => void;
  initialQuery?: string;
}

export const CommandSearch: React.FC<CommandSearchProps> = ({ onNavigate, onSelectSeedling, onClose, initialQuery = '' }) => {
  const { seedlings } = useGarden();
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
    // If there is an initial query, put cursor at the end
    if (initialQuery && inputRef.current) {
      inputRef.current.setSelectionRange(initialQuery.length, initialQuery.length);
    }
  }, [initialQuery]);

  // Prevent body scrolling when search is active
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  // Multi-source lists search indexing
  const indexSources = [
    // Core pathways
    { id: 'nav_dash', title: 'Go to Dashboard', category: 'Navigation', icon: <Compass className="w-4 h-4 text-emerald-600" />, action: () => onNavigate('dashboard') },
    { id: 'nav_edit', title: 'Open Markdown Editor', category: 'Navigation', icon: <BookOpen className="w-4 h-4 text-emerald-600" />, action: () => onNavigate('editor') },
    { id: 'nav_comp', title: 'Consult Companion Botanist', category: 'Navigation', icon: <Bot className="w-4 h-4 text-emerald-600" />, action: () => onNavigate('companion') },
    { id: 'nav_sett', title: 'Configure System Settings', category: 'Navigation', icon: <Settings className="w-4 h-4 text-emerald-600" />, action: () => onNavigate('settings') },
    
    // Notes and Tasks index matching
    ...seedlings.map(seed => {
      const isTask = seed.isTask === true;
      return {
        id: `seed_${seed.id}`,
        title: seed.title || 'Untitled Seedling',
        category: isTask ? 'Task' : 'Note',
        icon: isTask ? (
          <CheckCircle2 className={`w-4 h-4 ${seed.isCompleted ? 'text-emerald-500' : 'text-amber-500'}`} />
        ) : (
          <FileText className="w-4 h-4 text-sky-500" />
        ),
        action: () => {
          onSelectSeedling(seed.id);
          onNavigate('editor');
        }
      };
    })
  ];

  const filteredResults = indexSources.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Monitor keys for navigation index mapping and selections
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % filteredResults.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredResults.length) % filteredResults.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredResults[selectedIndex]) {
          filteredResults[selectedIndex].action();
          onClose();
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, filteredResults, onClose]);

  return (
    <div className="fixed inset-0 bg-slate-950/45 backdrop-blur-md z-50 flex items-start justify-center p-4 md:p-20 leading-relaxed font-sans animate-fade-in">
      
      {/* Search canvas card: Clean light mode slate styling */}
      <div className="bg-white border border-slate-200/80 text-slate-800 max-w-2xl w-full rounded-2xl shadow-2xl relative overflow-hidden mt-6 md:mt-12 flex flex-col max-h-[80vh]">
        
        {/* Core input field search */}
        <div className="flex items-center gap-3.5 border-b border-slate-100 bg-slate-50/40 px-5 py-4 shrink-0">
          <Search className="w-5 h-5 text-forest-500 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type 'editor' or 'seedling' tag keywords to search..."
            className="w-full bg-transparent border-0 text-slate-800 placeholder-slate-400 focus:outline-none text-sm md:text-base font-medium font-sans"
          />
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100/85 rounded-lg cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List scrollable */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-1 bg-white select-none min-h-0">
          {filteredResults.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs font-mono">
              No {searchQuery ? `"${searchQuery}"` : 'results'} found
            </div>
          ) : (
            filteredResults.map((item, idx) => {
              const isSelected = selectedIndex === idx;
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    item.action();
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`px-4 py-3 rounded-xl cursor-pointer flex items-center justify-between gap-4 transition-all duration-150 ${
                    isSelected 
                      ? 'bg-forest-50 border border-forest-100/80 text-forest-950 shadow-xs' 
                      : 'text-slate-600 border border-transparent hover:bg-slate-50/70 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={`shrink-0 transition-colors ${isSelected ? 'text-forest-600' : 'text-slate-400/80'}`}>
                      {item.icon}
                    </span>
                    <span className="text-xs md:text-sm truncate select-none font-sans font-medium">{item.title}</span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 uppercase font-mono">
                    <span className={`text-[9px] font-semibold px-2 py-0.5 rounded border transition-colors ${
                      isSelected 
                        ? 'bg-forest-100/60 border-forest-200/50 text-forest-800' 
                        : 'bg-slate-50 border-slate-100 text-slate-400'
                    }`}>
                      {item.category}
                    </span>
                    {isSelected && (
                      <span className="text-[9px] text-forest-600 font-bold shrink-0 hidden lg:inline ml-1">
                        [ENTER]
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Action guidelines footer */}
        <div className="bg-slate-50/80 border-t border-slate-100 px-5 py-3.5 hidden lg:flex items-center justify-between text-[10px] text-slate-400 font-mono shrink-0 select-none">
          <div className="flex gap-4">
            <span><strong className="text-slate-600 font-bold">ESC</strong> to exit</span>
            <span><strong className="text-slate-600 font-bold">⇅</strong> select list</span>
            <span><strong className="text-slate-600 font-bold">↩</strong> navigate-query</span>
          </div>
          <div className="flex items-center gap-1.5 text-forest-600 font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>powered by Synapze AI</span>
          </div>
        </div>

      </div>

    </div>
  );
};
