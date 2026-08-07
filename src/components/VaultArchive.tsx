import React, { useState, useEffect } from 'react';
import { useGarden } from '../lib/gardenState';
import { SeedlingNode, SeedlingStatus } from '../types';
import { Search, Trash2, FolderClosed, Archive, FileText, Check, ArrowUpRight, FolderHeart, Sprout } from 'lucide-react';
import { stripFormatting } from '../lib/editorUtils';

export const VaultArchive: React.FC<{ onNavigateToEditor: (id: string | null) => void }> = ({ onNavigateToEditor }) => {
  const { seedlings, deleteSeedling, triggerPushNotification, addSeedling, updateSeedling } = useGarden();
  const [searchVal, setSearchVal] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('archived'); // Default to Archived
  const [selectedNoteToArchive, setSelectedNoteToArchive] = useState('');

  // Normalize legacy status codes to active/archived for backward compatibility
  const getNormalizedStatus = (status: string): SeedlingStatus => {
    if (status === 'archived' || status === 'composted') return 'archived';
    return 'active';
  };

  const activeNotes = seedlings.filter(s => getNormalizedStatus(s.status) === 'active');
  const archivedNotes = seedlings.filter(s => getNormalizedStatus(s.status) === 'archived');
  const totalNotes = seedlings.length;

  // Search and filter matching
  const filteredSeedlings = seedlings.filter(s => {
    const matchesSearch = s.title.toLowerCase().includes(searchVal.toLowerCase()) || 
                          s.tags.some(tag => tag.toLowerCase().includes(searchVal.toLowerCase()));
    
    if (filterStatus === 'all') return matchesSearch;
    return getNormalizedStatus(s.status) === filterStatus && matchesSearch;
  });

  const archiveRatio = totalNotes > 0 ? Math.round((archivedNotes.length / totalNotes) * 100) : 0;

  const [isPurgeConfirmOpen, setIsPurgeConfirmOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<SeedlingNode | null>(null);

  // Prevent body scrolling when a modal overlay is active
  useEffect(() => {
    if (isPurgeConfirmOpen || noteToDelete) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isPurgeConfirmOpen, noteToDelete]);

  // Handle Purge all Archived Notes
  const handlePurgeArchived = async () => {
    if (archivedNotes.length === 0) {
      triggerPushNotification('Archive Empty', 'There are no notes in your Vault Archive to delete.', 'system');
      return;
    }
    setIsPurgeConfirmOpen(true);
  };

  // Add default demo notes
  const handleAddDemoFiles = async () => {
    await addSeedling({
      title: 'Grocery List - July',
      content: '# Grocery List - July\n\n- Organic celery seeds\n- Liquid fertilizer\n- Peat moss packets',
      tags: ['shopping', 'personal'],
      isTask: true,
      isCompleted: true,
      status: 'archived'
    });

    await addSeedling({
      title: 'Q3 Marketing Strategy Draft_v2',
      content: '# Q3 Marketing Strategy Draft_v2\n\nOutline social media campaign strategy targeting developers building digital garden portfolios.',
      tags: ['sprint', 'business'],
      isTask: false,
      isCompleted: false,
      status: 'active'
    });

    await addSeedling({
      title: 'Unlabeled Voice Recording #4 (AI Transcript)',
      content: '### Transcript\n\n"...and that’s why decentralized knowledge graphs match better than traditional directories..."',
      tags: ['audio', 'transcript'],
      isTask: false,
      isCompleted: false,
      status: 'active'
    });

    triggerPushNotification('Demo Notes Added', 'Populated active and archived demo notes.', 'system');
  };

  const handleQuickArchive = async () => {
    if (!selectedNoteToArchive) return;
    const target = activeNotes.find(n => n.id === selectedNoteToArchive);
    if (target) {
      await updateSeedling(selectedNoteToArchive, { status: 'archived' });
      setSelectedNoteToArchive('');
    }
  };

  const toggleArchiveStatus = async (e: React.MouseEvent, noteId: string, currentStatus: string) => {
    e.stopPropagation(); // Avoid triggering card navigation
    const target = seedlings.find(s => s.id === noteId);
    if (!target) return;

    const nextStatus = getNormalizedStatus(currentStatus) === 'archived' ? 'active' : 'archived';
    await updateSeedling(noteId, { status: nextStatus });
  };

  return (
    <div className="space-y-8 animate-fade-in text-slate-800">
      
      {/* Telemetry analytics stats header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card: Active Density */}
        <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-xs text-left">
          <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-400 mb-2">
            <span>ACTIVE WORKSPACE</span>
            <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded text-[10px]">CURRENT</span>
          </div>
          <div className="text-3xl font-display font-bold text-slate-900 mt-1">{activeNotes.length} Notes</div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full mt-3 overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(100, activeNotes.length * 10)}%` }} />
          </div>
          <p className="text-[10px] text-slate-400 mt-2">Active documents current editing and referenced.</p>
        </div>

        {/* Card: Archive density */}
        <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-xs text-left">
          <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-400 mb-2">
            <span>VAULT ARCHIVE RATE</span>
            <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded text-[10px]">STORAGE</span>
          </div>
          <div className="text-3xl font-display font-bold text-slate-900 mt-1">{archiveRatio}%</div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full mt-3 overflow-hidden">
            <div className="h-full bg-amber-500 rounded-full" style={{ width: `${archiveRatio}%` }} />
          </div>
          <p className="text-[10px] text-slate-400 mt-2">Percentage of notes organized into the long-term vault.</p>
        </div>

        {/* Action center station */}
        <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-xs flex flex-col justify-between text-left">
          <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-400 mb-1">
            <span>ARCHIVE CONTROLS</span>
            <Archive className="w-4 h-4 text-slate-400" />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handlePurgeArchived}
              className="flex-1 py-2.5 bg-slate-100 hover:bg-rose-50 border border-slate-200/40 hover:border-rose-200 text-rose-600 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Empty Archive
            </button>
          </div>
          <p className="text-[9px] font-mono text-slate-400 mt-2">Durable storage cleans clutter without data loss.</p>
        </div>

      </div>



      {/* Quick-Archive Selector - satisfying "just make it that users can add the note they want to archive" */}
      {activeNotes.length > 0 && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 flex flex-col sm:flex-row gap-4 items-center justify-between text-left shadow-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <FolderHeart className="w-4.5 h-4.5 text-[#203d36]" />
              <h3 className="text-xs font-mono font-bold text-[#203d36] tracking-wider uppercase">Archiving Quick-Station</h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Instantly move any active note directly into your archive vault list without opening the workspace editor.
            </p>
          </div>
          <div className="flex gap-2.5 w-full sm:w-auto shrink-0 select-none">
            <select
              value={selectedNoteToArchive}
              onChange={(e) => setSelectedNoteToArchive(e.target.value)}
              className="bg-slate-50 border border-slate-200/85 rounded-xl px-3 py-2 text-xs text-slate-600 focus:outline-hidden focus:border-forest-500 flex-1 sm:w-64 max-w-xs cursor-pointer"
            >
              <option value="">-- Choose active note --</option>
              {activeNotes.map((note) => (
                <option key={note.id} value={note.id}>
                  {note.title || 'Untitled Note'}
                </option>
              ))}
            </select>
            <button
              disabled={!selectedNoteToArchive}
              onClick={handleQuickArchive}
              className="bg-[#203d36] hover:bg-[#182e29] border border-[#203d36] text-white disabled:opacity-45 disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400 select-none px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
            >
              Archive Note
            </button>
          </div>
        </div>
      )}

      {/* Main vault listing */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
        
        {/* Search controls row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-100 text-left">
          
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
            <input
              type="text"
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              placeholder="Search by title, tag keyword..."
              className="w-full bg-slate-50 border border-slate-200 focus:border-forest-500 text-sm pl-10 pr-4 py-2.5 rounded-xl focus:outline-none transition-colors focus:bg-white text-slate-700"
            />
          </div>

          <div className="flex gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-mono font-semibold self-start md:self-center">
            {[
              { id: 'all', label: 'All notes' },
              { id: 'active', label: 'Active' },
              { id: 'archived', label: 'Archived' }
            ].map((option) => (
              <button
                key={option.id}
                onClick={() => setFilterStatus(option.id)}
                className={`px-3 py-1.5 rounded-lg select-none cursor-pointer uppercase text-[10px] leading-none transition-all ${
                  filterStatus === option.id ? 'bg-white text-forest-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

        </div>

        {/* Files Grid and directories mimic */}
        {filteredSeedlings.length === 0 ? (
          <div className="text-center py-16 text-slate-400 space-y-2">
            <FolderClosed className="w-12 h-12 text-slate-200 mx-auto" />
            <h4 className="font-display font-medium text-slate-600">No matching notes found</h4>
            <p className="text-xs max-w-xs mx-auto">Create a seed note or use the "Sow Demo Files" button to populate data!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
            {filteredSeedlings.map((seed) => {
              const currentNorm = getNormalizedStatus(seed.status);
              return (
                <div 
                  key={seed.id} 
                  onClick={() => onNavigateToEditor(seed.id)}
                  className="cursor-pointer border border-slate-200 hover:border-forest-200 p-5 rounded-2xl bg-slate-50/20 hover:bg-white shadow-xs group transition-all duration-200 flex flex-col justify-between"
                >
                  
                  {/* File icon header details */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-slate-300 group-hover:text-forest-400 duration-150">
                      <FileText className="w-8 h-8 shrink-0" />
                      
                      {/* Interactive toggle status and delete */}
                      <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={(e) => toggleArchiveStatus(e, seed.id, seed.status)}
                          className={`text-[9px] font-mono font-bold uppercase tracking-wide px-2 py-0.5 rounded cursor-pointer transition-colors border ${
                            currentNorm === 'archived' 
                              ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100' 
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                          }`}
                          title={currentNorm === 'archived' ? 'Restore Note' : 'Archive Note'}
                        >
                          {currentNorm === 'archived' ? 'Archived' : 'Active'}
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setNoteToDelete(seed);
                          }}
                          className="p-1 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                          title="Delete permanently"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <h4 className="font-display font-bold text-slate-800 group-hover:text-forest-600 transition-colors tracking-tight text-base leading-snug line-clamp-2">
                      {seed.title || 'Untitled Note'}
                    </h4>

                    <p className="text-slate-500 text-xs line-clamp-3 select-text leading-relaxed">
                      {stripFormatting(seed.content) || 'Empty draft document... Click to edit.'}
                    </p>
                  </div>

                  {/* Card footer details tags */}
                  <div className="flex flex-wrap gap-1 mt-4">
                    {seed.tags.slice(0, 2).map(tag => (
                      <span key={tag} className="text-[10px] font-mono text-slate-400">#{tag}</span>
                    ))}
                    <div className="text-[9px] text-slate-400 font-mono ml-auto self-center flex items-center gap-1">
                      <span>{new Date(seed.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                      <ArrowUpRight className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-all text-slate-400" />
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>

      {isPurgeConfirmOpen && (
        <div className="fixed inset-0 bg-slate-950/20 backdrop-blur-xl flex items-center justify-center p-4 z-50 pointer-events-auto animate-fade-in">
          <div className="bg-white border border-slate-200/80 rounded-[1.8rem] w-full max-w-md overflow-hidden shadow-2xl p-6 text-left space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <h3 className="font-serif text-lg font-bold text-slate-900 leading-tight">
                  Empty Archive Vault?
                </h3>
                <p className="text-xs text-slate-500">
                  Are you absolutely sure you want to permanently delete all {archivedNotes.length} archived seedlings?
                </p>
              </div>
            </div>
            
            <p className="text-xs text-slate-500 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100 font-mono">
              This action is irreversible. All selected archive nodes will be permanently composted and removed from database storage.
            </p>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setIsPurgeConfirmOpen(false)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors cursor-pointer text-center"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  setIsPurgeConfirmOpen(false);
                  for (const note of archivedNotes) {
                    await deleteSeedling(note.id);
                  }
                  triggerPushNotification('Purge Successful', 'Deleted archived notes permanently.', 'system');
                }}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl text-xs transition-colors cursor-pointer text-center shadow-xs"
              >
                Yes, Empty Archive
              </button>
            </div>
          </div>
        </div>
      )}

      {noteToDelete && (
        <div className="fixed inset-0 bg-slate-950/20 backdrop-blur-xl flex items-center justify-center p-4 z-50 pointer-events-auto animate-fade-in">
          <div className="bg-white border border-slate-200/80 rounded-[1.8rem] w-full max-w-md overflow-hidden shadow-2xl p-6 text-left space-y-5 animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <h3 className="font-serif text-lg font-bold text-slate-900 leading-tight">
                  Delete Seedling permanently?
                </h3>
                <p className="text-xs text-slate-500">
                  CRITICAL ACTION
                </p>
              </div>
            </div>

            <p className="text-slate-600 text-xs leading-relaxed font-sans">
              Are you sure you want to permanently delete the seedling <strong className="text-slate-900 font-semibold font-serif">"{noteToDelete.title || 'Untitled Note'}"</strong>? This will retire the note forever and cannot be undone.
            </p>

            <div className="flex gap-3 pt-2 text-xs font-mono">
              <button
                onClick={() => setNoteToDelete(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors cursor-pointer text-center"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  const id = noteToDelete.id;
                  const title = noteToDelete.title || 'Untitled Note';
                  setNoteToDelete(null);
                  await deleteSeedling(id);
                  triggerPushNotification('Note Deleted', `"${title}" has been deleted.`, 'system');
                }}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl transition-colors cursor-pointer text-center shadow-xs"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
