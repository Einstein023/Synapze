import React, { useState } from 'react';
import { useGarden } from '../lib/gardenState';
import { Sprout, Plus, Move, Tag, Check, Image, HelpCircle, ArrowRight, Zap, Inbox, Edit3 } from 'lucide-react';
import { stripFormatting } from '../lib/editorUtils';

export const FastCapture: React.FC = () => {
  const { seedlings, addSeedling, updateSeedling, triggerPushNotification } = useGarden();
  const [mindInput, setMindInput] = useState('');
  const [isTaskMode, setIsTaskMode] = useState(false);
  const [selectedTag, setSelectedTag] = useState('draft');

  const presetTags = ['draft', 'quick-note', 'sprint', 'personal', 'idea'];

  const handleCapture = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mindInput.trim()) {
      triggerPushNotification('Capture Empty', "Please write down a thought first!", 'system');
      return;
    }

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
    triggerPushNotification('Captured!', 'Saved to your inbox. You can edit and expand it in the Editor anytime.', 'plant');
  };

  const capturedNodes = seedlings.filter(s => s.tags.includes('captured') || s.title.includes('Capture'));

  return (
    <div className="space-y-8 animate-fade-in text-slate-800 max-w-4xl mx-auto">
      
      {/* Onboarding / How it works Guide */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-6 space-y-3">
        <div>
          <h2 className="font-display font-semibold text-slate-900 text-sm sm:text-base">How Fast Capture Works</h2>
          <p className="text-slate-600 text-xs sm:text-sm mt-1 leading-relaxed hidden sm:block">
            Think of this as a digital scratching pad for your mind. It is designed to let you download fleeting thoughts or tasks instantly before they slip away.
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-6 pt-3 border-t border-slate-100">
          <div className="space-y-0.5 sm:space-y-1">
            <span className="font-mono text-[10px] sm:text-xs font-bold text-forest-600 block uppercase tracking-wider">Step 01</span>
            <p className="text-xs text-slate-500 leading-relaxed"><strong>Jot it down:</strong> Type your thoughts freely without worrying about formatting.</p>
          </div>
          <div className="space-y-0.5 sm:space-y-1 hidden sm:block">
            <span className="font-mono text-[10px] sm:text-xs font-bold text-forest-600 block uppercase tracking-wider">Step 02</span>
            <p className="text-xs text-slate-500 leading-relaxed"><strong>Land in Inbox:</strong> Automatically saved to your inbox below.</p>
          </div>
          <div className="space-y-0.5 sm:space-y-1 hidden sm:block">
            <span className="font-mono text-[10px] sm:text-xs font-bold text-forest-600 block uppercase tracking-wider">Step 03</span>
            <p className="text-xs text-slate-500 leading-relaxed"><strong>Refine in Editor:</strong> Expand notes and link ideas later.</p>
          </div>
        </div>
      </div>

      {/* Rapid capture core card */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 md:p-8 shadow-xs relative">
        <div className="absolute top-0 left-0 w-2 h-full bg-forest-500" />
        
        <div className="space-y-1 mb-6">
          <h1 className="font-display text-2xl font-bold text-slate-900 tracking-tight">Fast Capture Workspace</h1>
          <p className="text-slate-500 text-sm">Download your thoughts rapidly. We'll help you organize and nurture them later.</p>
        </div>

        <form onSubmit={handleCapture} className="space-y-6">
          
          {/* Main textarea mind input */}
          <div className="space-y-2">
            <label className="text-xs font-mono font-bold text-slate-400 block tracking-wider uppercase">What is on your mind?</label>
            <textarea
              value={mindInput}
              onChange={(e) => setMindInput(e.target.value)}
              placeholder="add your idea here"
              className="w-full h-28 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-base focus:outline-none focus:border-forest-500 placeholder-slate-400 transition-colors focus:bg-white leading-relaxed resize-none font-medium"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Thought format switcher */}
            <div className="space-y-2.5">
              <label className="text-xs font-mono font-bold text-slate-400 block tracking-wider uppercase">Create as...</label>
              
              <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200/50 relative gap-1">
                <button
                  type="button"
                  onClick={() => setIsTaskMode(false)}
                  className={`flex-1 py-3.5 text-xs sm:text-sm font-bold rounded-xl select-none transition-all cursor-pointer min-h-[48px] flex items-center justify-center gap-1.5 ${
                    !isTaskMode 
                      ? 'bg-white text-forest-700 shadow-sm' 
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  📝 Quick Thought
                </button>
                <button
                  type="button"
                  onClick={() => setIsTaskMode(true)}
                  className={`flex-1 py-3.5 text-xs sm:text-sm font-bold rounded-xl select-none transition-all cursor-pointer min-h-[48px] flex items-center justify-center gap-1.5 ${
                    isTaskMode 
                      ? 'bg-white text-forest-700 shadow-sm' 
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  📋 Action Checkbox
                </button>
              </div>
            </div>

            {/* Quick Presets tags select */}
            <div className="space-y-2.5">
              <label className="text-xs font-mono font-bold text-slate-400 block tracking-wider uppercase">Add Category Tag</label>
              <div className="flex flex-wrap gap-2 pt-1">
                {presetTags.map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setSelectedTag(tag)}
                    className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-mono border select-none cursor-pointer transition-colors min-h-[44px] flex items-center justify-center ${
                      selectedTag === tag 
                        ? 'bg-forest-50 border-forest-300 text-forest-700 font-bold shadow-xs' 
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900'
                    }`}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>

          </div>

          <button
            type="submit"
            id="btn_fast_capture_submit"
            className="w-full py-4 px-6 bg-forest-500 hover:bg-forest-600 active:bg-forest-700 text-white font-bold text-sm sm:text-base rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[52px]"
          >
            <Plus className="w-5 h-5" />
            Save to Inbox Feed
          </button>

        </form>

      </div>

      {/* Captured seedlings list view */}
      <div className="space-y-4">
        <h3 className="font-display font-semibold text-lg text-slate-800 flex items-center gap-2">
          <Inbox className="w-5 h-5 text-forest-500" />
          Your Quick Captures Inbox
        </h3>

        {capturedNodes.length === 0 ? (
          <div className="p-12 text-center rounded-2xl border border-dashed border-slate-200 bg-white">
            <HelpCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-500 text-sm">No quick captures saved yet. Type a thought above to populate your inbox.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {capturedNodes.map(node => (
              <div 
                key={node.id} 
                className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs flex items-start gap-4 transition-all hover:border-forest-200 group"
              >
                
                {/* Seedling Status Icon */}
                <div className="text-emerald-500 shrink-0 py-0.5">
                  <Sprout className="w-4 h-4" />
                </div>

                {/* Content */}
                <div className="flex-1 space-y-2 min-w-0">
                  <div className="flex items-center gap-2.5">
                    {node.isTask && (
                      <button
                        onClick={() => updateSeedling(node.id, { isCompleted: !node.isCompleted })}
                        className={`w-4.5 h-4.5 rounded border flex items-center justify-center cursor-pointer transition-colors ${
                          node.isCompleted 
                            ? 'bg-emerald-500 border-emerald-500 text-white' 
                            : 'border-slate-300 hover:border-emerald-500 hover:bg-slate-50 text-transparent hover:text-slate-400'
                        }`}
                      >
                        ✓
                      </button>
                    )}
                    <h4 className={`font-display font-bold text-slate-900 group-hover:text-forest-600 transition-colors text-sm md:text-base truncate leading-none ${
                      node.isCompleted ? 'line-through text-slate-400!' : ''
                    }`}>
                      {node.title}
                    </h4>
                  </div>

                  <p className="text-slate-500 text-xs md:text-sm line-clamp-2 pl-7 select-text">
                    {stripFormatting(node.content)}
                  </p>

                  <div className="flex items-center gap-2 text-xs text-slate-400 pl-7 font-mono">
                    <span className="bg-forest-50 text-forest-700 px-1.5 py-0.5 rounded leading-none text-[9px] uppercase font-bold text-center">
                      #{node.tags[0] || 'draft'}
                    </span>
                    <span>Saved at {new Date(node.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>

                </div>

                {/* Information Badge for User workflow direction */}
                <div className="text-slate-300 group-hover:text-forest-500 transition-colors py-0.5 shrink-0 flex items-center gap-1 text-xs">
                  <span className="hidden sm:inline font-mono text-[10px]">Open in Editor</span>
                  <ArrowRight className="w-4 h-4" />
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

