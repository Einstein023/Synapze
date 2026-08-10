import React, { useState } from 'react';
import { useGarden } from '../lib/gardenState';
import { SeedlingNode } from '../types';
import { 
  Plus, 
  Tag, 
  Check, 
  Inbox, 
  Edit3, 
  Trash2, 
  FileText, 
  CheckSquare, 
  Clock, 
  Sparkles,
  ArrowUpRight,
  Search,
  CheckCircle2,
  CornerDownLeft,
  AlertTriangle,
  X
} from 'lucide-react';
import { stripFormatting } from '../lib/editorUtils';

interface FastCaptureProps {
  onNavigateToEditor?: (id: string) => void;
}

export const FastCapture: React.FC<FastCaptureProps> = ({ onNavigateToEditor }) => {
  const { seedlings, addSeedling, updateSeedling, deleteSeedling } = useGarden();
  const [mindInput, setMindInput] = useState('');
  const [isTaskMode, setIsTaskMode] = useState(false);
  const [selectedTag, setSelectedTag] = useState('quick-note');
  const [filterMode, setFilterMode] = useState<'all' | 'notes' | 'tasks'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [noteToDelete, setNoteToDelete] = useState<SeedlingNode | null>(null);

  const presetTags = ['quick-note', 'idea', 'sprint', 'personal', 'draft'];

  const handleCapture = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!mindInput.trim()) return;

    const titlePrefix = isTaskMode ? '📋 ' : '✍️ ';
    const cleanTitle = mindInput.length > 50 ? mindInput.substring(0, 47) + '...' : mindInput;
    await addSeedling({
      title: `${titlePrefix}${cleanTitle}`,
      content: mindInput,
      tags: [selectedTag, 'captured'],
      isTask: isTaskMode,
      isCompleted: false,
      status: 'active'
    });

    setMindInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleCapture();
    }
  };

  const capturedNodes = seedlings.filter(s => s.tags.includes('captured') || s.title.includes('Capture'));

  const filteredNodes = capturedNodes.filter(node => {
    if (filterMode === 'notes' && node.isTask) return false;
    if (filterMode === 'tasks' && !node.isTask) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = node.title.toLowerCase().includes(q);
      const matchContent = node.content.toLowerCase().includes(q);
      const matchTag = node.tags.some(t => t.toLowerCase().includes(q));
      return matchTitle || matchContent || matchTag;
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in text-slate-800 max-w-3xl mx-auto">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 pb-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-slate-900 tracking-tight">
            Fast Capture
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Quickly dump ideas, thoughts, or tasks before they slip away.
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 font-mono bg-slate-100 px-3 py-1.5 rounded-lg shrink-0 self-start sm:self-center">
          <span>Press</span>
          <kbd className="px-1.5 py-0.5 bg-white rounded border border-slate-200 text-slate-600 font-bold text-[10px] shadow-2xs">⌘ / Ctrl</kbd>
          <span>+</span>
          <kbd className="px-1.5 py-0.5 bg-white rounded border border-slate-200 text-slate-600 font-bold text-[10px] shadow-2xs">Enter</kbd>
          <span>to save</span>
        </div>
      </div>

      {/* Main Scratchpad Card */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4 overflow-hidden">
        <form onSubmit={handleCapture} className="space-y-4">
          
          {/* Main Textarea */}
          <div className="relative">
            <textarea
              value={mindInput}
              onChange={(e) => setMindInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isTaskMode ? "Type an action item or task to complete..." : "Write down a thought, idea, or reminder..."}
              className="w-full h-32 bg-slate-50 border border-slate-200/90 rounded-xl p-4 text-sm focus:outline-none focus:border-forest-500 focus:bg-white text-slate-800 placeholder-slate-400 transition-all leading-relaxed resize-none font-medium focus:ring-3 focus:ring-forest-500/10"
              required
            />
          </div>

          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-100">
            
            {/* Left Controls: Note/Task Switcher & Tag Picker */}
            <div className="flex flex-wrap items-center gap-2 min-w-0 max-w-full">
              
              {/* Type Switcher */}
              <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/60 text-xs font-semibold shrink-0">
                <button
                  type="button"
                  onClick={() => setIsTaskMode(false)}
                  className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                    !isTaskMode 
                      ? 'bg-white text-forest-700 shadow-2xs font-bold' 
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Note</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsTaskMode(true)}
                  className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                    isTaskMode 
                      ? 'bg-white text-forest-700 shadow-2xs font-bold' 
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <CheckSquare className="w-3.5 h-3.5" />
                  <span>Task</span>
                </button>
              </div>

              {/* Tag Selector Carousel */}
              <div className="flex items-center gap-1 overflow-x-auto py-0.5 min-w-0 max-w-full no-scrollbar">
                {presetTags.map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setSelectedTag(tag)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-colors border cursor-pointer whitespace-nowrap shrink-0 ${
                      selectedTag === tag 
                        ? 'bg-forest-50 border-forest-300 text-forest-700 font-bold' 
                        : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-800'
                    }`}
                  >
                    #{tag}
                  </button>
                ))}
              </div>

            </div>

            {/* Right Control: Submit Button */}
            <button
              type="submit"
              disabled={!mindInput.trim()}
              className="px-5 py-2 bg-forest-600 hover:bg-forest-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer shrink-0 ml-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Save to Inbox</span>
              <CornerDownLeft className="w-3 h-3 text-emerald-200 hidden sm:inline" />
            </button>

          </div>

        </form>
      </div>

      {/* Inbox Section */}
      <div className="space-y-3 pt-2">
        
        {/* Inbox Header & Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          
          <div className="flex items-center gap-2">
            <h2 className="font-display font-bold text-slate-800 text-base flex items-center gap-2">
              <Inbox className="w-4 h-4 text-forest-600" />
              Captured Inbox
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200/80 text-xs font-mono font-bold text-slate-600">
              {capturedNodes.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            
            {/* Search Filter */}
            {capturedNodes.length > 3 && (
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter captures..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-forest-500 text-slate-700 w-36 sm:w-44"
                />
              </div>
            )}

            {/* Mode Filters */}
            <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200/60 text-[11px] font-semibold">
              <button
                onClick={() => setFilterMode('all')}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  filterMode === 'all' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterMode('notes')}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  filterMode === 'notes' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Notes
              </button>
              <button
                onClick={() => setFilterMode('tasks')}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  filterMode === 'tasks' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Tasks
              </button>
            </div>

          </div>

        </div>

        {/* Captured Items List */}
        {filteredNodes.length === 0 ? (
          <div className="p-8 text-center rounded-2xl border border-dashed border-slate-200/90 bg-white/60 space-y-2">
            <Inbox className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-slate-500 text-xs sm:text-sm font-medium">
              {capturedNodes.length === 0 
                ? "Your inbox is clear. Type a thought above to capture it." 
                : "No captured items match your search or filter."}
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredNodes.map(node => (
              <div 
                key={node.id}
                className="bg-white border border-slate-200/80 hover:border-forest-300 p-4 rounded-xl shadow-2xs transition-all flex items-start justify-between gap-3 group"
              >
                
                {/* Left Content Area */}
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  
                  {/* Task Checkbox or Note Icon */}
                  <div className="shrink-0 mt-0.5">
                    {node.isTask ? (
                      <button
                        onClick={() => updateSeedling(node.id, { isCompleted: !node.isCompleted })}
                        className={`w-5 h-5 rounded-md border flex items-center justify-center cursor-pointer transition-all ${
                          node.isCompleted 
                            ? 'bg-forest-600 border-forest-600 text-white' 
                            : 'border-slate-300 hover:border-forest-500 bg-white text-transparent'
                        }`}
                        title={node.isCompleted ? "Mark incomplete" : "Mark completed"}
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </button>
                    ) : (
                      <div className="w-5 h-5 rounded-md bg-forest-50 text-forest-600 flex items-center justify-center">
                        <FileText className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>

                  {/* Text & Meta */}
                  <div className="min-w-0 flex-1 space-y-1">
                    
                    <div className="flex items-center gap-2">
                      <h3 className={`text-sm font-semibold text-slate-800 transition-colors leading-snug truncate ${
                        node.isCompleted ? 'line-through text-slate-400' : ''
                      }`}>
                        {node.title.replace(/^(📋 |✍️ )/, '')}
                      </h3>
                      
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-mono rounded font-medium shrink-0">
                        #{node.tags[0] || 'draft'}
                      </span>
                    </div>

                    {node.content && (
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {stripFormatting(node.content)}
                      </p>
                    )}

                    <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400 pt-0.5">
                      <Clock className="w-3 h-3 text-slate-300" />
                      <span>{new Date(node.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <span>•</span>
                      <span>{new Date(node.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                    </div>

                  </div>

                </div>

                {/* Right Action Buttons */}
                <div className="flex items-center gap-1 shrink-0 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                  
                  {onNavigateToEditor && (
                    <button
                      onClick={() => onNavigateToEditor(node.id)}
                      className="p-1.5 text-slate-400 hover:text-forest-600 hover:bg-forest-50 rounded-lg transition-colors cursor-pointer"
                      title="Open in Editor"
                    >
                      <ArrowUpRight className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    onClick={() => setNoteToDelete(node)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title="Delete capture"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                </div>

              </div>
            ))}
          </div>
        )}

      </div>

      {/* Centered High-Visibility Delete Modal */}
      {noteToDelete && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 z-[9999] overflow-y-auto animate-fade-in">
          <div className="bg-white border border-slate-200/90 rounded-3xl w-full max-w-sm sm:max-w-md shadow-2xl overflow-hidden relative my-auto text-left">
            
            {/* Top Red Alert Gradient */}
            <div className="h-2 bg-gradient-to-r from-rose-500 via-rose-600 to-amber-500 w-full" />

            {/* Close Button Top Right */}
            <button
              type="button"
              onClick={() => setNoteToDelete(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-6 sm:p-7 space-y-5">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-rose-100/80 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0 shadow-xs">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div className="pr-6">
                  <h3 className="font-extrabold text-lg sm:text-xl text-slate-900 tracking-tight leading-snug">
                    Delete Note?
                  </h3>
                  <p className="text-slate-500 text-xs sm:text-sm font-medium mt-1 leading-relaxed">
                    This action cannot be undone and will permanently remove this item.
                  </p>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl">
                <p className="text-slate-400 text-[10px] font-mono uppercase tracking-wider font-bold mb-1">Note to be deleted:</p>
                <p className="text-slate-800 font-bold text-sm truncate">
                  "{noteToDelete.title || 'Untitled Note'}"
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setNoteToDelete(null)}
                  className="w-full py-3.5 px-4 bg-slate-100 hover:bg-slate-200/80 text-slate-700 font-bold rounded-2xl text-xs sm:text-sm transition-all cursor-pointer text-center flex items-center justify-center min-h-[48px]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    const id = noteToDelete.id;
                    setNoteToDelete(null);
                    await deleteSeedling(id);
                  }}
                  className="w-full py-3.5 px-4 bg-rose-600 hover:bg-rose-700 active:scale-[0.98] text-white font-bold rounded-2xl text-xs sm:text-sm transition-all shadow-md shadow-rose-600/25 cursor-pointer flex items-center justify-center gap-2 min-h-[48px]"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Note</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
