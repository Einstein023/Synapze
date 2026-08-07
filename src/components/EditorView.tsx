import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useGarden } from '../lib/gardenState';
import { SeedlingNode, SeedlingStatus } from '../types';
import { 
  Save, 
  Trash2, 
  Bot, 
  Sprout,
  HelpCircle, 
  ArrowLeft,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Quote,
  CheckCircle2,
  Image as ImageIcon,
  Tag,
  RefreshCw,
  Sparkles,
  Type,
  Code,
  CheckSquare,
  X
} from 'lucide-react';
import { convertMarkdownToHtml } from '../lib/editorUtils';

interface EditorViewProps {
  activeSeedlingId: string | null;
  onBack: () => void;
  onSelectSeedling?: (id: string | null) => void;
}

export const EditorView: React.FC<EditorViewProps> = ({ activeSeedlingId, onBack, onSelectSeedling }) => {
  const { seedlings, addSeedling, updateSeedling, deleteSeedling, triggerPushNotification, profile } = useGarden();
  const editorRef = useRef<HTMLDivElement>(null);
  const markdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Track actual active seedling state locally to prevent repeated creation of new seedlings when saving multiple times
  const [localActiveId, setLocalActiveId] = useState<string | null>(activeSeedlingId);

  useEffect(() => {
    setLocalActiveId(activeSeedlingId);
  }, [activeSeedlingId]);

  useEffect(() => {
    return () => {
      if (markdownTimeoutRef.current) {
        clearTimeout(markdownTimeoutRef.current);
      }
    };
  }, []);

  // Ref to prevent reloading innerHTML and losing cursor caret position during editing
  const lastLoadedIdRef = useRef<string | null>(undefined);

  // Core state for active note
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [status, setStatus] = useState<SeedlingStatus>('active');
  const [isTask, setIsTask] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  // Drag and drop states & file input ref
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Companion Botanist Sidebar Chat
  const [isCompanionOpen, setIsCompanionOpen] = useState(false);
  const [companionTips, setCompanionTips] = useState<string>('');
  const [isLoadingTips, setIsLoadingTips] = useState(false);
  const [isRewritingMode, setIsRewritingMode] = useState<'friendly' | 'humanize' | 'professional' | 'poetic' | null>(null);

  // Tracks if there are unsaved edits
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Custom Delete Confirm Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [confirmTitleInput, setConfirmTitleInput] = useState('');

  // Prevent body scrolling when delete modal is open
  useEffect(() => {
    if (isDeleteModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isDeleteModalOpen]);

  // Load / Setup current note data
  useEffect(() => {
    if (lastLoadedIdRef.current !== activeSeedlingId) {
      lastLoadedIdRef.current = activeSeedlingId;
      
      if (activeSeedlingId) {
        const activeSeed = seedlings.find(s => s.id === activeSeedlingId);
        if (activeSeed) {
          setTitle(activeSeed.title);
          const initialHtml = convertMarkdownToHtml(activeSeed.content);
          setContent(initialHtml);
          setTagsInput(activeSeed.tags.join(', '));
          setStatus(activeSeed.status);
          setIsTask(activeSeed.isTask);
          setIsCompleted(activeSeed.isCompleted);
          setIsDirty(false);
          
          if (editorRef.current) {
            editorRef.current.innerHTML = initialHtml;
          }
        }
      } else {
        // Build an elegant empty starter seed showing placeholders
        const starterTitle = '';
        setTitle(starterTitle);
        setTagsInput('');
        setStatus('active');
        setIsTask(false);
        setIsCompleted(false);
        setIsDirty(false);
        
        const starterHtml = '';
        setContent(starterHtml);
        if (editorRef.current) {
          editorRef.current.innerHTML = starterHtml;
        }
      }
    }
  }, [activeSeedlingId, seedlings]);

  const scrollToCursor = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      
      // Find the scrollable container wrapper of of the editor view (Note Document Column Layout)
      const scrollContainer = editorRef.current?.closest('.overflow-y-auto') as HTMLElement;
      if (scrollContainer && rect && rect.bottom > 0) {
        const containerRect = scrollContainer.getBoundingClientRect();
        
        // If cursor gets within 120px of the container bottom or goes past it, scroll it down smoothly
        const cursorFromBottom = containerRect.bottom - rect.bottom;
        if (cursorFromBottom < 120) {
          scrollContainer.scrollBy({
            top: 160 - cursorFromBottom,
            behavior: 'smooth'
          });
        }
      }
    }
  };

  // Synchronize ContentEditable back to state
  const handleInput = () => {
    if (editorRef.current) {
      setContent(editorRef.current.innerHTML);
      setIsDirty(true);
      scrollToCursor();
    }
  };

  // Convert markdown constructs with a 500ms delay after user pauses or finishes typing a shortcut trigger
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0);
    const container = range.startContainer;

    // --- Smart Typo Autocorrect System ---
    if (e.key === ' ' || e.key === 'Enter') {
      if (container && container.nodeType === Node.TEXT_NODE) {
        const text = container.textContent || '';
        const caretOffset = range.startOffset;
        const beforeCaret = text.substring(0, caretOffset);
        const words = beforeCaret.split(/\s+/);
        const lastWord = words[words.length - 1];
        
        const typos: Record<string, string> = {
          'te': 'the',
          'adn': 'and',
          'wiht': 'with',
          'recieve': 'receive',
          'seperate': 'separate'
        };

        const normalizedWord = lastWord.toLowerCase().replace(/[^a-z]/g, '');
        if (typos[normalizedWord]) {
          const correction = typos[normalizedWord];
          const rejectionKey = `autocorrect_reject_${normalizedWord}`;
          const rejectionsCount = parseInt(localStorage.getItem(rejectionKey) || '0', 10);
          
          if (rejectionsCount < 3) {
            const wasRecentlyRejected = sessionStorage.getItem(`recently_rejected_${normalizedWord}`) === 'true';

            if (!wasRecentlyRejected) {
              e.preventDefault();
              
              let correctedWord = correction;
              if (lastWord[0] === lastWord[0].toUpperCase()) {
                correctedWord = correction[0].toUpperCase() + correction.slice(1);
              }
              
              const beforeWord = beforeCaret.substring(0, beforeCaret.length - lastWord.length);
              const afterCaret = text.substring(caretOffset);
              
              container.textContent = beforeWord + correctedWord + (e.key === ' ' ? ' ' : '\n') + afterCaret;
              
              const newOffset = (beforeWord + correctedWord + (e.key === ' ' ? ' ' : '\n')).length;
              const newRange = document.createRange();
              newRange.setStart(container, newOffset);
              newRange.setEnd(container, newOffset);
              selection.removeAllRanges();
              selection.addRange(newRange);

              sessionStorage.setItem('last_autocorrect_original', lastWord);
              sessionStorage.setItem('last_autocorrect_corrected', correctedWord);
              sessionStorage.setItem('last_autocorrect_time', Date.now().toString());
              
              if (editorRef.current) {
                setContent(editorRef.current.innerHTML);
                setIsDirty(true);
              }
              return;
            }
          }
        }
      }
    }

    if (e.key === 'Backspace') {
      if (container && container.nodeType === Node.TEXT_NODE) {
        const text = container.textContent || '';
        const caretOffset = range.startOffset;
        
        const lastCorrected = sessionStorage.getItem('last_autocorrect_corrected');
        const lastOriginal = sessionStorage.getItem('last_autocorrect_original');
        const lastTime = parseInt(sessionStorage.getItem('last_autocorrect_time') || '0', 10);
        
        if (lastCorrected && lastOriginal && (Date.now() - lastTime < 3000)) {
          const beforeCaret = text.substring(0, caretOffset).trim();
          if (beforeCaret.endsWith(lastCorrected)) {
            const rejectKey = lastOriginal.toLowerCase().replace(/[^a-z]/g, '');
            sessionStorage.setItem(`recently_rejected_${rejectKey}`, 'true');
            
            const longTermKey = `autocorrect_reject_${rejectKey}`;
            const currentCount = parseInt(localStorage.getItem(longTermKey) || '0', 10);
            localStorage.setItem(longTermKey, (currentCount + 1).toString());
          }
        }
      }
    }
    // --- End Autocorrect ---

    if (e.key === 'Enter') {
      let isInsideBlockquote = false;
      let blockquoteEl: HTMLElement | null = null;
      let cur: HTMLElement | null = container.nodeType === Node.ELEMENT_NODE 
        ? (container as HTMLElement) 
        : container.parentElement;

      while (cur && cur !== editorRef.current) {
        if (cur.tagName.toLowerCase() === 'blockquote') {
          isInsideBlockquote = true;
          blockquoteEl = cur;
          break;
        }
        cur = cur.parentElement;
      }

      if (isInsideBlockquote && blockquoteEl) {
        let activeBlock = container.nodeType === Node.ELEMENT_NODE 
          ? (container as HTMLElement) 
          : container.parentElement;
          
        while (activeBlock && activeBlock !== editorRef.current) {
          const tagName = activeBlock.tagName.toLowerCase();
          if (['p', 'div', 'blockquote', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li'].includes(tagName)) {
            break;
          }
          activeBlock = activeBlock.parentElement;
        }

        let isEmptyLine = false;
        if (activeBlock === blockquoteEl) {
          const text = (container.textContent || '').trim().replace(/\u200B/g, '');
          if (text === '') {
            isEmptyLine = true;
          }
        } else if (activeBlock) {
          const text = (activeBlock.textContent || '').trim().replace(/\u200B/g, '');
          if (text === '') {
            isEmptyLine = true;
          }
        }

        if (isEmptyLine && activeBlock) {
          e.preventDefault();
          
          const newPEl = document.createElement('p');
          newPEl.className = 'text-slate-700 leading-relaxed text-left my-2';
          newPEl.innerHTML = '<br>';

          if (activeBlock === blockquoteEl) {
            const bqText = (blockquoteEl.textContent || '').trim().replace(/\u200B/g, '');
            if (bqText === '') {
              blockquoteEl.parentNode?.replaceChild(newPEl, blockquoteEl);
            } else {
              if (blockquoteEl.nextSibling) {
                blockquoteEl.parentNode?.insertBefore(newPEl, blockquoteEl.nextSibling);
              } else {
                blockquoteEl.parentNode?.appendChild(newPEl);
              }
              if (container.parentNode === blockquoteEl) {
                blockquoteEl.removeChild(container);
              }
            }
            restoreCursorAtOffset(newPEl, 0);
          } else {
            const siblingsAfter: Node[] = [];
            let nextSib = activeBlock.nextSibling;
            while (nextSib) {
              siblingsAfter.push(nextSib);
              nextSib = nextSib.nextSibling;
            }
            
            if (blockquoteEl.nextSibling) {
              blockquoteEl.parentNode?.insertBefore(newPEl, blockquoteEl.nextSibling);
            } else {
              blockquoteEl.parentNode?.appendChild(newPEl);
            }
            
            if (siblingsAfter.length > 0) {
              const newBlockquote = document.createElement('blockquote');
              newBlockquote.className = blockquoteEl.className;
              
              if (newPEl.nextSibling) {
                newPEl.parentNode?.insertBefore(newBlockquote, newPEl.nextSibling);
              } else {
                newPEl.parentNode?.appendChild(newBlockquote);
              }
              
              siblingsAfter.forEach(sib => {
                newBlockquote.appendChild(sib);
              });
            }
            
            activeBlock.parentNode?.removeChild(activeBlock);
            
            if (blockquoteEl.childNodes.length === 0 || (blockquoteEl.textContent || '').trim() === '') {
              blockquoteEl.parentNode?.removeChild(blockquoteEl);
            }
            
            restoreCursorAtOffset(newPEl, 0);
          }
          
          setContent(editorRef.current?.innerHTML || '');
          setIsDirty(true);
          return;
        }
      }
    }

    if (e.key === ' ' || e.key === 'Spacebar') {
      // Clear any prior pending conversion timers
      if (markdownTimeoutRef.current) {
        clearTimeout(markdownTimeoutRef.current);
      }

      // Capture current cursor container and character offset
      const targetContainer = container;
      const targetOffset = range.startOffset;

      markdownTimeoutRef.current = setTimeout(() => {
        applyMarkdownConversion(targetContainer, targetOffset);
      }, 500);
    }
  };

  const restoreCursorAtOffset = (node: Node, offset: number) => {
    const selection = window.getSelection();
    if (!selection) return;
    
    const range = document.createRange();
    let textNode: Node | null = null;
    
    const findTextNode = (n: Node): boolean => {
      if (n.nodeType === Node.TEXT_NODE) {
        textNode = n;
        return true;
      }
      for (let i = 0; i < n.childNodes.length; i++) {
        if (findTextNode(n.childNodes[i])) return true;
      }
      return false;
    };
    
    findTextNode(node);
    
    if (textNode) {
      const len = (textNode as Node).textContent?.length || 0;
      const targetOffset = Math.min(offset, len);
      range.setStart(textNode, targetOffset);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
    } else {
      range.selectNodeContents(node);
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);
    }
  };

  const applyMarkdownConversion = (targetContainer: Node, originalOffset: number) => {
    const selection = window.getSelection();
    if (!selection) return;

    // 1. Resolve parent block element safely
    let block = targetContainer.nodeType === Node.ELEMENT_NODE 
      ? (targetContainer as HTMLElement) 
      : targetContainer.parentElement;
      
    while (block && block !== editorRef.current) {
      const tagName = block.tagName.toLowerCase();
      if (['p', 'div', 'blockquote', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li'].includes(tagName)) {
        break;
      }
      block = block.parentElement;
    }
    
    // Handle loose text nodes on the first line (not wrapped in standard block wrapper elements yet)
    if (!block || block === editorRef.current) {
      if (targetContainer.nodeType === Node.TEXT_NODE) {
        const parent = targetContainer.parentNode;
        if (parent) {
          const pElement = document.createElement('p');
          const range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
          const startOffset = range ? range.startOffset : 0;
          
          parent.insertBefore(pElement, targetContainer);
          pElement.appendChild(targetContainer);
          block = pElement;
          
          const newRange = document.createRange();
          newRange.setStart(targetContainer, startOffset);
          newRange.collapse(true);
          selection.removeAllRanges();
          selection.addRange(newRange);
        }
      }
    }
    
    if (block && block !== editorRef.current) {
      // Ensure we don't convert if it's already structured as a custom task checkbox
      if (block.querySelector('.task-checkbox')) {
        return;
      }

      const text = block.textContent || '';
      
      // H3 Heading Check (highest precedence first)
      if (text.startsWith('### ')) {
        const remainingText = text.substring(4);
        const newEl = document.createElement('h3');
        newEl.className = 'font-display font-medium text-lg text-slate-800 text-left mt-2 mb-1';
        newEl.innerHTML = remainingText || '<br>';
        
        block.parentNode?.replaceChild(newEl, block);
        restoreCursorAtOffset(newEl, remainingText.length);
        
        setContent(editorRef.current?.innerHTML || '');
        setIsDirty(true);
        return;
      }

      // H2 Heading Check
      if (text.startsWith('## ')) {
        const remainingText = text.substring(3);
        const newEl = document.createElement('h2');
        newEl.className = 'font-display font-semibold text-xl text-[#203d36] text-left mt-3 mb-1.5';
        newEl.innerHTML = remainingText || '<br>';
        
        block.parentNode?.replaceChild(newEl, block);
        restoreCursorAtOffset(newEl, remainingText.length);
        
        setContent(editorRef.current?.innerHTML || '');
        setIsDirty(true);
        return;
      }

      // H1 Heading Check
      if (text.startsWith('# ')) {
        const remainingText = text.substring(2);
        const newEl = document.createElement('h1');
        newEl.className = 'font-serif font-bold text-2xl md:text-3xl text-[#203d36] text-left mt-4 mb-2';
        newEl.innerHTML = remainingText || '<br>';
        
        block.parentNode?.replaceChild(newEl, block);
        restoreCursorAtOffset(newEl, remainingText.length);
        
        setContent(editorRef.current?.innerHTML || '');
        setIsDirty(true);
        return;
      }

      // Blockquote Check
      if (text.startsWith('> ')) {
        const remainingText = text.substring(2);
        const newEl = document.createElement('blockquote');
        newEl.className = 'border-l-4 border-emerald-500 pl-4 py-1.5 my-3 italic text-slate-600 bg-slate-50/55 rounded-r-lg text-left';
        newEl.innerHTML = remainingText || '<br>';
        
        block.parentNode?.replaceChild(newEl, block);
        restoreCursorAtOffset(newEl, remainingText.length);
        
        setContent(editorRef.current?.innerHTML || '');
        setIsDirty(true);
        return;
      }

      // Custom Task Checklist (checkbox initial)
      if (text.startsWith('- [ ] ') || text.startsWith('[ ] ')) {
        const prefixLen = text.startsWith('- [ ] ') ? 6 : 4;
        const remainingText = text.substring(prefixLen);
        block.innerHTML = '';
        
        const checkboxSpan = document.createElement('span');
        checkboxSpan.className = 'task-checkbox cursor-pointer select-none text-emerald-600 font-mono inline-block mr-1';
        checkboxSpan.setAttribute('contenteditable', 'false');
        checkboxSpan.innerText = '⬜';
        
        const textSpan = document.createElement('span');
        textSpan.className = 'task-text';
        textSpan.innerHTML = remainingText || '&#8203;';
        
        block.appendChild(checkboxSpan);
        block.appendChild(textSpan);
        
        const newRange = document.createRange();
        newRange.setStart(textSpan, remainingText.length > 0 ? 1 : 0);
        newRange.collapse(true);
        selection.removeAllRanges();
        selection.addRange(newRange);
        
        setContent(editorRef.current?.innerHTML || '');
        setIsDirty(true);
        setIsTask(true);
        return;
      }

      // Checklist completed Check
      if (text.toLowerCase().startsWith('- [x] ') || text.toLowerCase().startsWith('[x] ')) {
        const prefixLen = text.toLowerCase().startsWith('- [x] ') ? 6 : 4;
        const remainingText = text.substring(prefixLen);
        block.innerHTML = '';
        
        const checkboxSpan = document.createElement('span');
        checkboxSpan.className = 'task-checkbox cursor-pointer select-none text-emerald-600 font-mono inline-block mr-1';
        checkboxSpan.setAttribute('contenteditable', 'false');
        checkboxSpan.innerText = '✅';
        
        const textSpan = document.createElement('span');
        textSpan.className = 'task-text';
        textSpan.innerHTML = remainingText || '&#8203;';
        textSpan.style.textDecoration = 'line-through';
        textSpan.style.color = '#94a3b8';
        
        block.appendChild(checkboxSpan);
        block.appendChild(textSpan);
        
        const newRange = document.createRange();
        newRange.setStart(textSpan, remainingText.length > 0 ? 1 : 0);
        newRange.collapse(true);
        selection.removeAllRanges();
        selection.addRange(newRange);
        
        setContent(editorRef.current?.innerHTML || '');
        setIsDirty(true);
        setIsTask(true);
        setIsCompleted(true);
        return;
      }

      // Bullet List Item Check
      if (text.startsWith('- ') || text.startsWith('* ')) {
        const remainingText = text.substring(2);
        block.innerHTML = remainingText || '<br>';
        
        const rangeToSelect = document.createRange();
        rangeToSelect.selectNodeContents(block);
        selection.removeAllRanges();
        selection.addRange(rangeToSelect);
        
        document.execCommand('insertUnorderedList');
        selection.collapseToEnd();
        
        setContent(editorRef.current?.innerHTML || '');
        setIsDirty(true);
        return;
      }

      // Numbered List Item Check
      if (text.startsWith('1. ')) {
        const remainingText = text.substring(3);
        block.innerHTML = remainingText || '<br>';
        
        const rangeToSelect = document.createRange();
        rangeToSelect.selectNodeContents(block);
        selection.removeAllRanges();
        selection.addRange(rangeToSelect);
        
        document.execCommand('insertOrderedList');
        selection.collapseToEnd();
        
        setContent(editorRef.current?.innerHTML || '');
        setIsDirty(true);
        return;
      }
    }

    // 2. Inline styled conversions (Bold, Italic, Strikethrough, Code inline)
    if (targetContainer.nodeType === Node.TEXT_NODE) {
      const text = targetContainer.textContent || '';
      
      const bMatch = text.match(/\*\*([^\*]+?)\*\*/);
      const iMatch = text.match(/\*([^\*]+?)\*/);
      const sMatch = text.match(/~~([^~]+?)~~/);
      const cMatch = text.match(/`([^`]+?)`/);
      
      let matchInfo = null;
      let elementCreator = null;
      
      if (bMatch) {
        matchInfo = bMatch;
        elementCreator = (val: string) => {
          const el = document.createElement('strong');
          el.className = 'font-bold text-[#203d36]';
          el.innerText = val;
          return el;
        };
      } else if (iMatch) {
        matchInfo = iMatch;
        elementCreator = (val: string) => {
          const el = document.createElement('em');
          el.className = 'italic';
          el.innerText = val;
          return el;
        };
      } else if (sMatch) {
        matchInfo = sMatch;
        elementCreator = (val: string) => {
          const el = document.createElement('span');
          el.style.textDecoration = 'line-through';
          el.style.color = '#94a3b8';
          el.innerText = val;
          return el;
        };
      } else if (cMatch) {
        matchInfo = cMatch;
        elementCreator = (val: string) => {
          const el = document.createElement('code');
          el.className = 'bg-slate-100/90 text-rose-600 font-mono text-xs px-1.5 py-0.5 rounded border border-slate-200/40';
          el.innerText = val;
          return el;
        };
      }
      
      if (matchInfo && elementCreator) {
        const fullMatch = matchInfo[0];
        const captureVal = matchInfo[1];
        const matchIndex = matchInfo.index !== undefined ? matchInfo.index : 0;
        
        const parentNode = targetContainer.parentNode;
        if (parentNode) {
          const textBeforeMatch = text.substring(0, matchIndex);
          const textAfterMatch = text.substring(matchIndex + fullMatch.length);
          
          const textBeforeNode = document.createTextNode(textBeforeMatch);
          const formattedNode = elementCreator(captureVal);
          const textAfterNode = document.createTextNode(textAfterMatch);
          
          parentNode.insertBefore(textBeforeNode, targetContainer);
          parentNode.insertBefore(formattedNode, targetContainer);
          parentNode.insertBefore(textAfterNode, targetContainer);
          parentNode.removeChild(targetContainer);
          
          const nextRange = document.createRange();
          nextRange.setStart(textAfterNode, 0);
          nextRange.collapse(true);
          selection.removeAllRanges();
          selection.addRange(nextRange);
          
          setContent(editorRef.current?.innerHTML || '');
          setIsDirty(true);
        }
      }
    }
  };

  // Keep track of Title/Tags adjustments
  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    setIsDirty(true);
  };

  const handleTagsChange = (newTags: string) => {
    setTagsInput(newTags);
    setIsDirty(true);
  };

  const handleStageChange = (newStatus: SeedlingStatus) => {
    setStatus(newStatus);
    setIsDirty(true);
  };

  // Perform Wysiwyg Formatting Block command
  const format = (command: string, value: string = '') => {
    document.execCommand(command, false, value);
    // Refresh content state
    if (editorRef.current) {
      setContent(editorRef.current.innerHTML);
      setIsDirty(true);
    }
  };

  // Insert custom list styles
  const formatBlock = (tag: string) => {
    document.execCommand('formatBlock', false, tag);
    if (editorRef.current) {
      setContent(editorRef.current.innerHTML);
      setIsDirty(true);
    }
  };

  // Insert HTML visual element (like image or checkbox) directly at caret cursor focus
  const insertHtmlAtCursor = (html: string) => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      range.deleteContents();
      
      const el = document.createElement('div');
      el.innerHTML = html;
      
      const frag = document.createDocumentFragment();
      let node;
      let lastNode;
      while ((node = el.firstChild)) {
        lastNode = frag.appendChild(node);
      }
      
      range.insertNode(frag);
      
      // Relocate focus offset to end of layout
      if (lastNode) {
        const nextRange = range.cloneRange();
        nextRange.setStartAfter(lastNode);
        nextRange.collapse(true);
        selection.removeAllRanges();
        selection.addRange(nextRange);
      }
    } else {
      if (editorRef.current) {
        editorRef.current.innerHTML += html;
      }
    }
    
    if (editorRef.current) {
      setContent(editorRef.current.innerHTML);
      setIsDirty(true);
    }
  };

  // Click handler specifically for toggling checkmarks within contentEditable
  const handleEditorClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    
    // Check if target is a checkbox, or if the user clicked directly on the checkbox text
    const isCheckbox = target.classList?.contains('task-checkbox') || 
                      target.innerText === '⬜' || 
                      target.innerText === '✅';
                       
    if (isCheckbox) {
      e.preventDefault();
      e.stopPropagation();
      
      const isCurrentlyChecked = target.innerText.includes('✅');
      if (!isCurrentlyChecked) {
        target.innerText = '✅';
        const sibling = target.nextElementSibling as HTMLElement;
        if (sibling && (sibling.classList.contains('task-text') || sibling.tagName.toLowerCase() === 'span')) {
          sibling.style.textDecoration = 'line-through';
          sibling.style.color = '#94a3b8'; // tailwind text-slate-400
        } else if (sibling) {
          // Fallback only if sibling is not a structural block element
          const tag = sibling.tagName.toLowerCase();
          if (tag !== 'p' && tag !== 'div' && tag !== 'blockquote') {
            sibling.style.textDecoration = 'line-through';
            sibling.style.color = '#94a3b8';
          }
        }
      } else {
        target.innerText = '⬜';
        const sibling = target.nextElementSibling as HTMLElement;
        if (sibling && (sibling.classList.contains('task-text') || sibling.tagName.toLowerCase() === 'span')) {
          sibling.style.textDecoration = 'none';
          sibling.style.color = ''; // reset
        } else if (sibling) {
          const tag = sibling.tagName.toLowerCase();
          if (tag !== 'p' && tag !== 'div' && tag !== 'blockquote') {
            sibling.style.textDecoration = 'none';
            sibling.style.color = '';
          }
        }
      }
      
      if (editorRef.current) {
        setContent(editorRef.current.innerHTML);
        setIsDirty(true);
      }
    }
  };

  // Formats customized checkmarks and focuses selection inside the text sibling
  const insertTaskCheckbox = () => {
    const selection = window.getSelection();
    if (!selection) return;

    // Enforce editor is focused first
    if (editorRef.current && document.activeElement !== editorRef.current) {
      editorRef.current.focus();
    }

    if (selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0);

    // Identify if the current line/paragraph already has a checkbox
    let currentLine: HTMLElement | null = range.startContainer.nodeType === Node.ELEMENT_NODE
      ? (range.startContainer as HTMLElement)
      : range.startContainer.parentElement;

    while (currentLine && currentLine !== editorRef.current) {
      const tagName = currentLine.tagName.toLowerCase();
      if (['p', 'div', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote'].includes(tagName)) {
        break;
      }
      currentLine = currentLine.parentElement;
    }

    // If we are inside a specific line block, check if a checkbox already exists
    if (currentLine && currentLine !== editorRef.current) {
      const hasCheckbox = currentLine.querySelector('.task-checkbox') !== null;
      if (hasCheckbox) {
        // Line already has a checkbox. Avoid duplicating it.
        return;
      }
    }

    // Create custom checkbox element (not contenteditable)
    const checkboxSpan = document.createElement('span');
    checkboxSpan.className = 'task-checkbox cursor-pointer select-none text-emerald-600 font-mono inline-block mr-1';
    checkboxSpan.setAttribute('contenteditable', 'false');
    checkboxSpan.innerText = '⬜';

    // Create target write-in text element (contenteditable inline)
    const textSpan = document.createElement('span');
    textSpan.className = 'task-text';
    // Use a zero-width space so the cursor can sit inside the empty tag
    textSpan.innerHTML = '&#8203;';

    range.deleteContents();

    // Check if the cursor is at the root level of the rich text editor
    const parentElement = range.startContainer.parentElement;
    const isAtTopLevel = parentElement === editorRef.current || range.startContainer === editorRef.current;

    if (isAtTopLevel) {
      const p = document.createElement('p');
      p.appendChild(checkboxSpan);
      p.appendChild(textSpan);
      range.insertNode(p);
    } else {
      range.insertNode(textSpan);
      range.insertNode(checkboxSpan);
    }

    // Direct cursor focus inside the writable text span right after the checkbox
    const nextRange = document.createRange();
    nextRange.setStart(textSpan, 0);
    nextRange.collapse(true);

    selection.removeAllRanges();
    selection.addRange(nextRange);

    if (editorRef.current) {
      setContent(editorRef.current.innerHTML);
      setIsDirty(true);
      setIsTask(true);
    }
  };

  // Centralized helper to save the note data (supports standard save & background autosave)
  const saveNodeData = async (isAutosave: boolean = false) => {
    if (!title.trim()) {
      return null;
    }

    setIsSaving(true);
    try {
      const { innerHTML: rawHtml = "" } = editorRef.current || { innerHTML: content };

      const cleanedTags = tagsInput
        .split(',')
        .map(t => t.trim().toLowerCase())
        .filter(t => t.length > 0);

      const currentId = activeSeedlingId || localActiveId;

      if (currentId) {
        await updateSeedling(currentId, {
          title,
          content: rawHtml,
          tags: cleanedTags,
          status,
          isTask,
          isCompleted
        });
        setIsDirty(false);
        if (!isAutosave) {
          triggerPushNotification('Note Updated', `"${title}" saved.`, 'care');
        }
        return currentId;
      } else {
        const newId = await addSeedling({
          title,
          content: rawHtml,
          tags: cleanedTags,
          status,
          isTask,
          isCompleted
        });
        
        // Prevent further duplicates on subsequent clicks / autosaves
        setLocalActiveId(newId);
        lastLoadedIdRef.current = newId;
        onSelectSeedling?.(newId);
        setIsDirty(false);
        
        if (!isAutosave) {
          triggerPushNotification('Note Saved', `"${title}" created.`, 'plant');
        }
        return newId;
      }
    } catch (err) {
      console.error("Failed to save note:", err);
    } finally {
      setIsSaving(false);
    }
    return null;
  };

  // Actions trigger: Save Note (User Clicked)
  const handleSave = async () => {
    if (!title.trim()) {
      triggerPushNotification('Empty Title', 'Please enter a name for your note.', 'system');
      return;
    }
    await saveNodeData(false);
  };

  // Debounced Autosave effect
  useEffect(() => {
    if (!isDirty || !title.trim()) return;

    const timer = setTimeout(() => {
      saveNodeData(true);
    }, 2000); // 2 seconds delay

    return () => clearTimeout(timer);
  }, [title, content, tagsInput, status, isTask, isCompleted, isDirty]);

  // Actions trigger: Delete note
  const handleDelete = () => {
    if (activeSeedlingId) {
      setConfirmTitleInput('');
      setIsDeleteModalOpen(true);
    } else {
      onBack();
    }
  };

  const executeDelete = async () => {
    if (activeSeedlingId) {
      await deleteSeedling(activeSeedlingId);
      triggerPushNotification('Note Deleted', `"${title}" deleted.`, 'system');
      setIsDeleteModalOpen(false);
      onBack();
    }
  };

  // Drag-and-drop Image listeners
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processSelectedImage(files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processSelectedImage(files[0]);
    }
  };

  const processSelectedImage = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      triggerPushNotification('Invalid Attachment', 'Please upload a valid image file.', 'system');
      return;
    }

    triggerPushNotification('Uploading', 'Uploading image...', 'system');

    const reader = new FileReader();
    reader.onload = async () => {
      const base64Data = reader.result as string;
      
      try {
        const response = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileName: file.name,
            fileType: file.type,
            base64: base64Data
          })
        });

        if (!response.ok) {
          throw new Error('Image upload failed');
        }

        const data = await response.json();
        if (data.url) {
          const htmlImage = `<img src="${data.url}" alt="${file.name}" referrerPolicy="no-referrer" />`;
          insertHtmlAtCursor(htmlImage);
          triggerPushNotification('Uploaded', `"${file.name}" uploaded successfully.`, 'care');
          
          if (editorRef.current) {
            setContent(editorRef.current.innerHTML);
            setIsDirty(true);
          }
        }
      } catch (err) {
        console.error("Secure cloud upload failed, using offline fallback:", err);
        const htmlImage = `<img src="${base64Data}" alt="${file.name}" referrerPolicy="no-referrer" />`;
        insertHtmlAtCursor(htmlImage);
        triggerPushNotification('Offline Mode', 'Saved image locally.', 'system');
      }
    };
    reader.readAsDataURL(file);
  };

  // Companion AI review trigger
  const askBotanistAdvice = async () => {
    setIsCompanionOpen(true);
    setIsLoadingTips(true);
    setCompanionTips('');

    // Extract clean human text from contentEditable div
    const textContext = editorRef.current ? editorRef.current.innerText : content.replace(/<[^>]*>/g, ' ');

    try {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content: textContext,
          tags: tagsInput,
          companionName: profile.companionName || "Sprouty"
        })
      });

      if (!response.ok) {
        throw new Error('Server Gemini request failed');
      }

      const data = await response.json();
      setCompanionTips(data.advice || `Your thoughts are structured wonderfully. Keep recording sub-goals and nurturing tags to gain experience.`);
    } catch (error) {
      console.warn("Proxy advisor failed. Triggering client-side botanic heuristics advice:", error);
      setTimeout(() => {
        setCompanionTips(
          `### 🌿 ${profile.companionName || "Sprouty"}'s Advice:\n\n` +
          "1. **Decompose Action Items**: I noticed some outstanding steps! Highlight them, set to striking task checklist items, and plant milestones to maximize your gardening streak.\n" +
          "2. **Cluster Specific Tags**: Using rich tags like `composting`, `ideas`, and `sprint` triggers stronger botanical matches across your archive!\n" +
          "3. **Add Rich Media**: Drag and drop visual mockups directly on the sheet to anchor memory associations."
        );
      }, 1000);
    } finally {
      setIsLoadingTips(false);
    }
  };

  const cleanAiRewrite = (text: string): string => {
    let cleaned = text.trim();
    if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
      cleaned = cleaned.slice(1, -1).trim();
    } else if (cleaned.startsWith('`') && cleaned.endsWith('`')) {
      cleaned = cleaned.slice(1, -1).trim();
    }
    
    const introPatterns = [
      /^(here\s+is\s+the\s+(friendly|humanized|professional|poetic|rewritten)\s+version(\s+of\s+your\s+note)?:?)/i,
      /^(here\s+is\s+your\s+rewritten\s+note:?)/i,
      /^(here\s+is\s+a\s+(friendly|humanized|professional|poetic)\s+version:?)/i,
      /^(sure,\s+here\s+is\s+the\s+(friendly|humanized|professional|poetic)\s+version:?)/i,
      /^(certainly!\s+here\s+is\s+the\s+rewritten\s+text:?)/i,
      /^(certainly!\s+here\s+is\s+your\s+note:?)/i,
      /^(sure,\s+here's\s+the\s+rewritten\s+text:?)/i,
      /^(sure!\s+here's\s+a\s+(friendly|humanized|professional|poetic)\s+version:?)/i,
      /^(here's\s+the\s+(friendly|humanized|professional|poetic)\s+version:?)/i,
      /^(here\s+is\s+the\s+note\s+rewritten:?)/i,
      /^(as\s+requested,\s+here\s+is\s+the\s+rewritten\s+text:?)/i,
      /^(rewritten\s+version:?)/i,
      /^(friendly\s+version:?)/i,
      /^(professional\s+version:?)/i,
      /^(poetic\s+version:?)/i,
      /^(humanized\s+version:?)/i
    ];
    
    let matchFound = true;
    while (matchFound) {
      matchFound = false;
      for (const pattern of introPatterns) {
        if (pattern.test(cleaned)) {
          cleaned = cleaned.replace(pattern, '').trim();
          matchFound = true;
        }
      }
    }
    
    if (cleaned.startsWith('```')) {
      const lines = cleaned.split('\n');
      if (lines[0].startsWith('```')) {
        lines.shift();
      }
      if (lines[lines.length - 1].startsWith('```')) {
        lines.pop();
      }
      cleaned = lines.join('\n').trim();
    }
    
    return cleaned;
  };

  // Companion AI rewrite/expression trigger
  const rewriteContentExpression = async (mode: 'friendly' | 'humanize' | 'professional' | 'poetic') => {
    setIsRewritingMode(mode);
    
    // Extract clean human text from contentEditable div
    const textContext = editorRef.current ? editorRef.current.innerText : content.replace(/<[^>]*>/g, ' ');

    try {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content: textContext,
          tags: tagsInput,
          companionName: profile.companionName || "Sprouty",
          mode
        })
      });

      if (!response.ok) {
        throw new Error('Server Gemini rewrite failed');
      }

      const data = await response.json();
      const rawRewrittenResult = data.rewritten;
      
      if (rawRewrittenResult) {
        const rewrittenResult = cleanAiRewrite(rawRewrittenResult);
        // Update both local react state and contentEditable innerHTML
        const paragraphs = rewrittenResult.split('\n\n').map((p: string) => `<p>${p.replace(/\n/g, '<br/>')}</p>`).join('');
        setContent(paragraphs);
        if (editorRef.current) {
          editorRef.current.innerHTML = paragraphs;
        }
        setIsDirty(true);
        triggerPushNotification(
          `Expressed: ${mode.toUpperCase()}`,
          `Rewritten in ${mode} style.`,
          'system'
        );
      }
    } catch (error) {
      console.warn("Proxy rewrite failed:", error);
    } finally {
      setIsRewritingMode(null);
    }
  };

  return (
    <div className="flex-1 h-full min-h-[calc(100vh-73px)] flex flex-col bg-white relative">
      <style>{`
        .rich-editor h1 {
          font-family: ui-serif, Georgia, Cambria, "Times New Roman", Times, serif;
          font-size: 1.85rem;
          font-weight: 700;
          color: #203d36;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
          line-height: 1.25;
        }
        .rich-editor h2 {
          font-family: ui-serif, Georgia, Cambria, "Times New Roman", Times, serif;
          font-size: 1.45rem;
          font-weight: 600;
          color: #203d36;
          margin-top: 1.25rem;
          margin-bottom: 0.5rem;
          line-height: 1.3;
        }
        .rich-editor h3 {
          font-family: ui-serif, Georgia, Cambria, "Times New Roman", Times, serif;
          font-size: 1.25rem;
          font-weight: 600;
          color: #203d36;
          margin-top: 1rem;
          margin-bottom: 0.5rem;
        }
        .rich-editor p {
          font-size: 0.95rem;
          color: #334155;
          line-height: 1.625;
          margin-bottom: 0.875rem;
        }
        .rich-editor ul {
          list-style-type: disc;
          padding-left: 1.5rem;
          margin-bottom: 1rem;
        }
        .rich-editor ol {
          list-style-type: decimal;
          padding-left: 1.5rem;
          margin-bottom: 1rem;
        }
        .rich-editor li {
          font-size: 0.95rem;
          color: #334155;
          margin-bottom: 0.25rem;
          line-height: 1.6;
        }
        .rich-editor blockquote {
          border-left: 4px solid #203d36;
          padding-left: 1.25rem;
          font-style: italic;
          color: #475569;
          background-color: #f5f4ef/40;
          border-radius: 0 8px 8px 0;
          padding-top: 0.5rem;
          padding-bottom: 0.5rem;
          margin: 1.5rem 0;
        }
        .rich-editor img {
          max-height: 320px;
          max-width: 100%;
          border-radius: 16px;
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.03);
          border: 1px solid #e1dfd8;
          display: block;
          margin: 1.5rem auto;
        }
        .rich-editor code {
          font-family: monospace;
          background-color: #f1f5f9;
          color: #0f172a;
          padding: 2px 5px;
          border-radius: 4px;
          font-size: 0.825rem;
        }
        .rich-editor:empty::before {
          content: attr(placeholder);
          color: #94a3b8;
          pointer-events: none;
          font-style: italic;
        }
      `}</style>

      {/* Editor Control Header Toolbar */}
      <div className="bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex items-center justify-between gap-4 z-10 shrink-0">
        
        {/* Live Status Tracker */}
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${isSaving ? 'bg-amber-500 animate-pulse' : isDirty ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`} />
          <span className="text-[10px] font-mono tracking-wider font-semibold text-slate-500 uppercase">
            {isSaving ? 'SAVING...' : isDirty ? 'UNSAVED' : 'SAVED'}
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          {(activeSeedlingId || localActiveId) && (
            <button
              onClick={handleDelete}
              className="p-2 text-rose-500 hover:text-rose-700 rounded-xl hover:bg-rose-50 transition-colors cursor-pointer"
              title="Delete Seedling"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          
          <button
            onClick={handleSave}
            id="btn_editor_save"
            className="px-4 py-2 bg-[#203d36] hover:bg-[#162e29] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            Save Changes
          </button>
        </div>

      </div>

      {/* Main Sheet Workspace Area */}
      <div className="flex-1 flex overflow-hidden min-h-0 relative">
        
        {/* Note Document Column Layout */}
        <div className="flex-1 h-full overflow-y-auto custom-scrollbar p-0 w-full flex flex-col">
          
          {/* Pristine Document Card container */}
          <div className="bg-white px-6 sm:px-10 md:px-16 py-6 md:py-10 flex flex-col flex-1 min-h-full w-full max-w-5xl mx-auto">
            
            {/* Title formulation input */}
            <input
              type="text"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Sow seed title..."
              className="font-serif font-bold text-2xl md:text-3xl text-[#203d36] focus:outline-hidden w-full border-b border-dashed border-slate-200/60 pb-3 placeholder:text-slate-200 transition-all text-left animate-fade-in"
            />

            {/* Tags and Status settings rail */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3.5 py-4 border-b border-slate-100 text-xs text-left mb-4">
              
              {/* Tags Field */}
              <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                <Tag className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="text-slate-400 font-mono tracking-wider uppercase">Tags:</span>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => handleTagsChange(e.target.value)}
                  placeholder="marketing, journal"
                  className="bg-transparent focus:outline-hidden flex-1 text-slate-700 font-medium"
                />
              </div>

              {/* Document Type Selector (Note vs Todo / Task) */}
              <div className="flex items-center gap-2 text-xs shrink-0">
                <span className="text-slate-400 font-mono tracking-wider uppercase">Type:</span>
                <button
                  type="button"
                  onClick={() => {
                    setIsTask(!isTask);
                    setIsDirty(true);
                  }}
                  className={`px-3 py-1 rounded-lg border text-[11px] font-sans font-semibold transition-all flex items-center gap-1.5 cursor-pointer select-none ${
                    isTask
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                      : 'bg-sky-50 border-sky-200 text-sky-700 hover:bg-sky-100'
                  }`}
                >
                  {isTask ? '📋 Todo / Task' : '📝 Regular Note'}
                </button>
              </div>

              {/* Completion Toggle (Only for Todo / Task) */}
              {isTask && (
                <div className="flex items-center gap-2 text-xs shrink-0">
                  <span className="text-slate-400 font-mono tracking-wider uppercase">Task State:</span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCompleted(!isCompleted);
                      setIsDirty(true);
                      triggerPushNotification(
                        !isCompleted ? 'Task Completed' : 'Task Reopened',
                        !isCompleted ? 'Keep up the momentum in your digital garden!' : 'Take your time to nurture this goal.',
                        'care'
                      );
                    }}
                    className={`px-3 py-1 rounded-lg border text-[11px] font-sans font-semibold transition-all flex items-center gap-1.5 cursor-pointer select-none ${
                      isCompleted
                        ? 'bg-emerald-600 border-emerald-600 text-white hover:bg-emerald-700'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {isCompleted ? '✓ Completed' : '○ Pending'}
                  </button>
                </div>
              )}

              {/* Archive Toggle Button */}
              <div className="flex items-center gap-2 text-xs shrink-0">
                <span className="text-slate-400 font-mono tracking-wider uppercase">Status:</span>
                <button
                  type="button"
                  onClick={() => {
                    const newStatus = status === 'archived' ? 'active' : 'archived';
                    handleStageChange(newStatus);
                  }}
                  className={`px-3 py-1 rounded-lg border text-[11px] font-sans font-semibold transition-all flex items-center gap-1.5 cursor-pointer select-none ${
                    status === 'archived'
                      ? 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100'
                      : 'bg-slate-50 border-slate-200/80 text-emerald-700 hover:bg-slate-100'
                  }`}
                >
                  {status === 'archived' ? 'Archived' : 'Active'}
                </button>
              </div>

            </div>

            {/* Visual Formatting Toolbar */}
            <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md border-b border-slate-100 py-3 mb-6 flex flex-wrap items-center gap-1">
              {/* Type blocks */}
              <button
                type="button"
                onClick={() => formatBlock('<h1>')}
                className="p-1.5 hover:bg-slate-100 text-slate-600 hover:text-slate-900 rounded-lg transition-colors cursor-pointer"
                title="Heading 1"
              >
                <Heading1 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => formatBlock('<h2>')}
                className="p-1.5 hover:bg-slate-100 text-slate-600 hover:text-slate-900 rounded-lg transition-colors cursor-pointer"
                title="Heading 2"
              >
                <Heading2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => formatBlock('<p>')}
                className="p-1.5 hover:bg-slate-100 text-slate-600 hover:text-slate-900 rounded-lg transition-colors cursor-pointer"
                title="Normal Paragraph"
              >
                <Type className="w-4 h-4" />
              </button>

              <div className="w-[1px] h-5 bg-slate-200 mx-1.5" />

              {/* Inline layout styles */}
              <button
                type="button"
                onClick={() => format('bold')}
                className="p-1.5 hover:bg-slate-100 text-slate-600 hover:text-slate-900 rounded-lg transition-colors cursor-pointer"
                title="Bold"
              >
                <Bold className="w-4 h-4 font-bold" />
              </button>
              <button
                type="button"
                onClick={() => format('italic')}
                className="p-1.5 hover:bg-slate-100 text-slate-600 hover:text-slate-900 rounded-lg transition-colors cursor-pointer"
                title="Italic"
              >
                <Italic className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => format('underline')}
                className="p-1.5 hover:bg-slate-100 text-slate-600 hover:text-slate-900 rounded-lg transition-colors cursor-pointer"
                title="Underline"
              >
                <Underline className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => format('strikeThrough')}
                className="p-1.5 hover:bg-slate-100 text-slate-600 hover:text-slate-900 rounded-lg transition-colors cursor-pointer"
                title="Strikethrough"
              >
                <Strikethrough className="w-4 h-4" />
              </button>

              <div className="w-[1px] h-5 bg-slate-200 mx-1.5" />

              {/* Lists and Quote blocks */}
              <button
                type="button"
                onClick={() => format('insertUnorderedList')}
                className="p-1.5 hover:bg-slate-100 text-slate-600 hover:text-slate-900 rounded-lg transition-colors cursor-pointer"
                title="Bullet List"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => format('insertOrderedList')}
                className="p-1.5 hover:bg-slate-100 text-slate-600 hover:text-slate-900 rounded-lg transition-colors cursor-pointer"
                title="Numbered List"
              >
                <ListOrdered className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => formatBlock('<blockquote>')}
                className="p-1.5 hover:bg-slate-100 text-slate-600 hover:text-slate-900 rounded-lg transition-colors cursor-pointer"
                title="Block Quote"
              >
                <Quote className="w-4 h-4" />
              </button>

              <div className="w-[1px] h-5 bg-slate-200 mx-1.5" />

              {/* Task checkbox creator inside typography area */}
              <button
                type="button"
                onClick={insertTaskCheckbox}
                className="p-1.5 hover:bg-slate-100 text-slate-600 hover:text-slate-900 rounded-lg transition-colors cursor-pointer"
                title="Add Checkbox"
              >
                <CheckSquare className="w-4 h-4" />
              </button>

              {/* Add image visual */}
              <button
                type="button"
                onClick={triggerFileInput}
                className="p-1.5 hover:bg-slate-100 text-slate-600 hover:text-slate-900 rounded-lg transition-colors cursor-pointer ml-auto"
                title="Add Image Attachment"
              >
                <ImageIcon className="w-4 h-4" />
              </button>
            </div>

            {/* Genuine WYSIWYG ContentEditable workspace area */}
            <div 
              ref={editorRef}
              contentEditable
              onInput={handleInput}
              onKeyDown={handleKeyDown}
              onClick={handleEditorClick}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`rich-editor flex-1 min-h-[450px] focus:outline-hidden text-left cursor-text relative pb-24 transition-all ${
                isDragging ? 'bg-[#203d36]/5 rounded-xl px-4 ring-2 ring-dashed ring-[#203d36]/40' : ''
              }`}
              style={{ outline: 'none' }}
              placeholder="What's growing in your mind? Seed thoughts, checklists, or highlights here..."
            />

            {/* Hidden Input field for images sow uploads */}
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />

            {/* Sown images guide indicator inside document */}
            <div className="text-[10px] text-slate-400 font-mono text-center border-t border-slate-100 pt-4 flex items-center justify-between shrink-0">
              <span>DRAG & DROP IMAGES SECURELY INTO THE MIND</span>
              <span>Unlimited Height Mode</span>
            </div>

          </div>

        </div>

        {/* Companion Mascot Advice Sidebar */}
        {isCompanionOpen && createPortal(
          <div className="fixed bottom-6 right-6 w-80 md:w-96 max-w-[calc(100vw-32px)] h-[520px] max-h-[70vh] bg-slate-900 text-white z-50 shadow-2xl flex flex-col justify-between border border-slate-800 rounded-3xl overflow-hidden animate-fade-in">
            
            {/* Advice Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sprout className="w-5 h-5 text-emerald-400" />
                <span className="font-display font-bold text-sm tracking-tight text-emerald-400">{profile.companionName || "Sprouty"} the Botanist</span>
              </div>
              <button 
                onClick={() => setIsCompanionOpen(false)}
                className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Close Sidebar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Tips panel context */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-4 font-sans text-xs md:text-sm text-left">

              {isLoadingTips ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-3">
                  <RefreshCw className="w-6 h-6 text-emerald-400 animate-spin" />
                  <span className="font-mono text-[10px] text-slate-500">EXAMINING_NOTE_SOIL...</span>
                </div>
              ) : companionTips ? (
                <div className="p-4 bg-emerald-950/20 border border-emerald-950/80 text-slate-200 rounded-xl space-y-2 select-text font-sans">
                  <div className="font-display font-semibold text-emerald-400 text-sm flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    Growth Recommendations
                  </div>
                  <div className="text-xs pt-2 text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {companionTips}
                  </div>
                </div>
              ) : null}

              {/* Expressions rewrite tool panel */}
              <div className="pt-4 border-t border-slate-800/60 space-y-3">
                <p className="font-mono text-[9px] text-emerald-500 uppercase tracking-wider font-bold">Garden Rewrite Expressions</p>
                <div className="grid grid-cols-1 gap-2.5">
                  <button
                    onClick={() => rewriteContentExpression('friendly')}
                    disabled={isLoadingTips || isRewritingMode !== null}
                    className="w-full py-2.5 px-3 bg-slate-950/40 hover:bg-slate-950 border border-slate-800/60 rounded-xl text-left hover:border-emerald-500/40 transition-all text-[11px] font-semibold text-slate-200 flex items-center gap-2.5 cursor-pointer disabled:opacity-50"
                  >
                    <span className="text-base">{isRewritingMode === 'friendly' ? '⏳' : '😊'}</span>
                    <div>
                      <div className="font-bold text-slate-200">
                        {isRewritingMode === 'friendly' ? 'Warmly Expressing...' : 'Make Friendly'}
                      </div>
                      <div className="text-[9px] text-slate-400 font-normal leading-normal">Rewrites warmly in your own words</div>
                    </div>
                  </button>

                  <button
                    onClick={() => rewriteContentExpression('humanize')}
                    disabled={isLoadingTips || isRewritingMode !== null}
                    className="w-full py-2.5 px-3 bg-slate-950/40 hover:bg-slate-950 border border-slate-800/60 rounded-xl text-left hover:border-emerald-500/40 transition-all text-[11px] font-semibold text-slate-200 flex items-center gap-2.5 cursor-pointer disabled:opacity-50"
                  >
                    <span className="text-base">{isRewritingMode === 'humanize' ? '⏳' : '🌿'}</span>
                    <div>
                      <div className="font-bold text-slate-200">
                        {isRewritingMode === 'humanize' ? 'Humanizing Ideas...' : 'Humanize Expression'}
                      </div>
                      <div className="text-[9px] text-slate-400 font-normal leading-normal">Rewrites into authentic natural speech</div>
                    </div>
                  </button>

                  <button
                    onClick={() => rewriteContentExpression('professional')}
                    disabled={isLoadingTips || isRewritingMode !== null}
                    className="w-full py-2.5 px-3 bg-slate-950/40 hover:bg-slate-950 border border-slate-800/60 rounded-xl text-left hover:border-emerald-500/40 transition-all text-[11px] font-semibold text-slate-200 flex items-center gap-2.5 cursor-pointer disabled:opacity-50"
                  >
                    <span className="text-base">{isRewritingMode === 'professional' ? '⏳' : '💼'}</span>
                    <div>
                      <div className="font-bold text-slate-200">
                        {isRewritingMode === 'professional' ? 'Polishing Note...' : 'Professional Polish'}
                      </div>
                      <div className="text-[9px] text-slate-400 font-normal leading-normal">Polishes thoughts for business clarity</div>
                    </div>
                  </button>

                  <button
                    onClick={() => rewriteContentExpression('poetic')}
                    disabled={isLoadingTips || isRewritingMode !== null}
                    className="w-full py-2.5 px-3 bg-slate-950/40 hover:bg-slate-950 border border-slate-800/60 rounded-xl text-left hover:border-emerald-500/40 transition-all text-[11px] font-semibold text-slate-200 flex items-center gap-2.5 cursor-pointer disabled:opacity-50"
                  >
                    <span className="text-base">{isRewritingMode === 'poetic' ? '⏳' : '🌸'}</span>
                    <div>
                      <div className="font-bold text-slate-200">
                        {isRewritingMode === 'poetic' ? 'Infusing Metaphors...' : 'Poetic Metaphors'}
                      </div>
                      <div className="text-[9px] text-slate-400 font-normal leading-normal">Infuses garden metaphor imagery</div>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Advice footer actions */}
            <div className="p-4 border-t border-slate-800 bg-slate-950">
              <button
                onClick={askBotanistAdvice}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Sparkles className="w-4 h-4 animate-pulse" />
                Fertilize Advice
              </button>
            </div>

          </div>,
          document.body
        )}

      </div>

      {/* Floating Mascot Advisor activator (portal-rendered at body-level to guarantee fixed viewport alignment without interference) */}
      {!isCompanionOpen && createPortal(
        <button
          onClick={() => setIsCompanionOpen(true)}
          className={`fixed bottom-6 right-6 bg-slate-900 hover:bg-slate-950 text-emerald-400 hover:text-emerald-300 p-4 rounded-full shadow-2xl border border-slate-800/80 active:scale-95 duration-200 flex items-center justify-center gap-2 cursor-pointer z-50 animate-fade-in ${
            content && content.replace(/<[^>]*>/g, '').trim().length > 0 ? 'opacity-25 hover:opacity-100 transition-opacity' : 'opacity-100'
          }`}
          title="Consult Botanist Assistant"
        >
          <Sprout className="w-5 h-5 animate-bounce-slow" />
          <span className="text-xs font-mono font-semibold tracking-wider">ASK {(profile.companionName || "Sprouty").toUpperCase()}</span>
        </button>,
        document.body
      )}

      {/* Custom Delete Confirmation Modal */}
      {isDeleteModalOpen && (() => {
        const cleanTitleForVerification = title
          .replace(/[\u1F600-\u1F64F]|[\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]/g, '')
          .replace(/\p{Emoji_Presentation}|\p{Extended_Pictographic}|\p{Emoji}/gu, '')
          .replace(/\s+/g, ' ')
          .trim() || 'delete';
        
        const isMatch = confirmTitleInput.trim().toLowerCase() === cleanTitleForVerification.toLowerCase();

        return (
          <div className="fixed inset-0 bg-slate-950/45 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-white border border-slate-200/80 rounded-[1.8rem] w-full max-w-md overflow-hidden shadow-2xl p-6 text-left space-y-5 animate-fade-in">
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 shrink-0">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div className="space-y-0.5">
                  <h3 className="font-serif text-lg font-bold text-slate-900 leading-tight">
                    Delete Note?
                  </h3>
                  <p className="text-slate-400 text-xs font-mono">
                    CRITICAL ACTION
                  </p>
                </div>
              </div>

              <p className="text-slate-600 text-xs leading-relaxed font-sans">
                You are about to permanently delete the note <strong className="text-slate-900 font-semibold font-serif">"{title}"</strong>. This will retire the note forever and cannot be undone.
              </p>

              <div className="space-y-2">
                <label className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider block">
                  To confirm, please type "<span className="text-rose-600 font-mono font-bold">{cleanTitleForVerification}</span>" below:
                </label>
                <input
                  type="text"
                  value={confirmTitleInput}
                  onChange={(e) => setConfirmTitleInput(e.target.value)}
                  placeholder="Type note title..."
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-mono focus:outline-hidden focus:ring-1 focus:ring-rose-500/20 text-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 text-xs font-mono">
                <button
                  type="button"
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="px-4 py-2 hover:bg-slate-50 text-slate-500 rounded-xl font-bold uppercase transition-colors tracking-wide cursor-pointer"
                  id="btn_cancel_delete"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={executeDelete}
                  disabled={!isMatch}
                  className={`px-4 py-2.5 rounded-xl font-bold uppercase tracking-wider transition-all duration-150 cursor-pointer ${
                    isMatch
                      ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/10 active:scale-[0.98]'
                      : 'bg-rose-100 text-rose-300 border border-rose-200/50 cursor-not-allowed'
                  }`}
                  id="btn_confirm_delete"
                >
                  Delete
                </button>
              </div>

            </div>
          </div>
        );
      })()}

    </div>
  );
};
