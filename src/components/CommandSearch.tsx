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
    <div className="fixed inset-0 bg-slate-950/45 backdrop-blur-md z-50 flex items-start justify-center p-3 sm:p-6 md:p-20 leading-relaxed font-sans animate-fade-in">
      
      {/* Search canvas card: Clean light mode slate styling */}
      <div className="bg-white border border-slate-200/80 text-slate-800 max-w-3xl w-full rounded-2xl sm:rounded-3xl shadow-2xl relative overflow-hidden mt-2 sm:mt-6 md:mt-12 flex flex-col max-h-[85vh]">
        
        {/* Core input field search */}
        <div className="flex items-center gap-4 border-b border-slate-100 bg-slate-50/60 px-5 sm:px-7 py-4 sm:py-5 shrink-0 min-h-[64px]">
          <Search className="w-6 h-6 text-emerald-600 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type 'editor' or 'seedling' tag keywords to search..."
            className="w-full bg-transparent border-0 text-slate-800 placeholder-slate-400 focus:outline-none text-base sm:text-lg md:text-xl font-medium font-sans min-h-[48px]"
          />
          <button 
            onClick={onClose}
            className="p-2.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl cursor-pointer transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center shrink-0"
            aria-label="Close search"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results List scrollable */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 sm:p-4 space-y-1.5 bg-white select-none min-h-0">
          {filteredResults.length === 0 ? (
            <div className="py-14 text-center text-slate-400 text-sm font-mono">
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
                  className={`px-4 sm:px-5 py-3.5 sm:py-4 rounded-xl cursor-pointer flex items-center justify-between gap-4 transition-all duration-150 min-h-[52px] ${
                    isSelected 
                      ? 'bg-forest-50 border border-forest-100/80 text-forest-950 shadow-xs' 
                      : 'text-slate-600 border border-transparent hover:bg-slate-50/70 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <span className={`shrink-0 transition-colors ${isSelected ? 'text-forest-600' : 'text-slate-400/80'}`}>
                      {item.icon}
                    </span>
                    <span className="text-sm sm:text-base truncate select-none font-sans font-medium">{item.title}</span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 uppercase font-mono">
                    <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-lg border transition-colors ${
                      isSelected 
                        ? 'bg-forest-100/60 border-forest-200/50 text-forest-800' 
                        : 'bg-slate-50 border-slate-100 text-slate-400'
                    }`}>
                      {item.category}
                    </span>
                    {isSelected && (
                      <span className="text-[10px] text-forest-600 font-bold shrink-0 hidden lg:inline ml-1">
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
