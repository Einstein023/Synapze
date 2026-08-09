import React, { useState, useEffect, useRef } from 'react';
import { useGarden } from '../lib/gardenState';
import { SeedlingNode, SeedlingStatus } from '../types';
import { 
  Trash2, 
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
  CheckSquare,
  Image as ImageIcon,
  Tag,
  Check,
  FileText,
  Clock,
  Sparkles,
  Save,
  Archive,
  CheckCircle2
} from 'lucide-react';
import { convertMarkdownToHtml } from '../lib/editorUtils';

interface EditorViewProps {
  activeSeedlingId: string | null;
  onBack: () => void;
  onSelectSeedling?: (id: string | null) => void;
}

export const EditorView: React.FC<EditorViewProps> = ({ activeSeedlingId, onBack, onSelectSeedling }) => {
  const { seedlings, addSeedling, updateSeedling, deleteSeedling, triggerPushNotification } = useGarden();
  const editorRef = useRef<HTMLDivElement>(null);
  const markdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Track actual active seedling state locally to prevent repeated creation of new seedlings
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

  const lastLoadedIdRef = useRef<string | null>(undefined);
  const titleInputRef = useRef<HTMLInputElement>(null);

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

  // Load / Setup current note data & auto-focus title
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
        // Build an empty starter seed
        setTitle('');
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

      setTimeout(() => {
        titleInputRef.current?.focus();
      }, 100);
    }
  }, [activeSeedlingId, seedlings]);

  const scrollToCursor = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      const scrollContainer = editorRef.current?.closest('.overflow-y-auto') as HTMLElement;
      if (scrollContainer && rect && rect.bottom > 0) {
        const containerRect = scrollContainer.getBoundingClientRect();
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

  // Convert markdown constructs with delay
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
      if (markdownTimeoutRef.current) {
        clearTimeout(markdownTimeoutRef.current);
      }

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
      if (block.querySelector('.task-checkbox')) return;

      const text = block.textContent || '';
      
      if (text.startsWith('### ')) {
        const remainingText = text.substring(4);
        const newEl = document.createElement('h3');
        newEl.className = 'font-display font-semibold text-lg text-slate-800 text-left mt-3 mb-1.5';
        newEl.innerHTML = remainingText || '<br>';
        
        block.parentNode?.replaceChild(newEl, block);
        restoreCursorAtOffset(newEl, remainingText.length);
        
        setContent(editorRef.current?.innerHTML || '');
        setIsDirty(true);
        return;
      }

      if (text.startsWith('## ')) {
        const remainingText = text.substring(3);
        const newEl = document.createElement('h2');
        newEl.className = 'font-display font-bold text-xl text-forest-800 text-left mt-4 mb-2';
        newEl.innerHTML = remainingText || '<br>';
        
        block.parentNode?.replaceChild(newEl, block);
        restoreCursorAtOffset(newEl, remainingText.length);
        
        setContent(editorRef.current?.innerHTML || '');
        setIsDirty(true);
        return;
      }

      if (text.startsWith('# ')) {
        const remainingText = text.substring(2);
        const newEl = document.createElement('h1');
        newEl.className = 'font-display font-bold text-2xl md:text-3xl text-forest-900 text-left mt-5 mb-3';
        newEl.innerHTML = remainingText || '<br>';
        
        block.parentNode?.replaceChild(newEl, block);
        restoreCursorAtOffset(newEl, remainingText.length);
        
        setContent(editorRef.current?.innerHTML || '');
        setIsDirty(true);
        return;
      }

      if (text.startsWith('> ')) {
        const remainingText = text.substring(2);
        const newEl = document.createElement('blockquote');
        newEl.className = 'border-l-4 border-forest-500 pl-4 py-1.5 my-3 italic text-slate-600 bg-slate-50 rounded-r-lg text-left';
        newEl.innerHTML = remainingText || '<br>';
        
        block.parentNode?.replaceChild(newEl, block);
        restoreCursorAtOffset(newEl, remainingText.length);
        
        setContent(editorRef.current?.innerHTML || '');
        setIsDirty(true);
        return;
      }

      if (text.startsWith('- [ ] ') || text.startsWith('[ ] ')) {
        const prefixLen = text.startsWith('- [ ] ') ? 6 : 4;
        const remainingText = text.substring(prefixLen);
        block.innerHTML = '';
        
        const checkboxSpan = document.createElement('span');
        checkboxSpan.className = 'task-checkbox cursor-pointer select-none text-forest-600 font-mono inline-block mr-1.5';
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

      if (text.toLowerCase().startsWith('- [x] ') || text.toLowerCase().startsWith('[x] ')) {
        const prefixLen = text.toLowerCase().startsWith('- [x] ') ? 6 : 4;
        const remainingText = text.substring(prefixLen);
        block.innerHTML = '';
        
        const checkboxSpan = document.createElement('span');
        checkboxSpan.className = 'task-checkbox cursor-pointer select-none text-forest-600 font-mono inline-block mr-1.5';
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
  };

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    setIsDirty(true);
  };

  const handleTagsChange = (newTags: string) => {
    setTagsInput(newTags);
    setIsDirty(true);
  };

  const format = (command: string, value: string = '') => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      setContent(editorRef.current.innerHTML);
      setIsDirty(true);
    }
  };

  const formatBlock = (tag: string) => {
    document.execCommand('formatBlock', false, tag);
    if (editorRef.current) {
      setContent(editorRef.current.innerHTML);
      setIsDirty(true);
    }
  };

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

  const handleEditorClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    
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
          sibling.style.color = '#94a3b8';
        }
      } else {
        target.innerText = '⬜';
        const sibling = target.nextElementSibling as HTMLElement;
        if (sibling && (sibling.classList.contains('task-text') || sibling.tagName.toLowerCase() === 'span')) {
          sibling.style.textDecoration = 'none';
          sibling.style.color = '';
        }
      }
      
      if (editorRef.current) {
        setContent(editorRef.current.innerHTML);
        setIsDirty(true);
      }
    }
  };

  const insertTaskCheckbox = () => {
    const selection = window.getSelection();
    if (!selection) return;

    if (editorRef.current && document.activeElement !== editorRef.current) {
      editorRef.current.focus();
    }

    if (selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0);

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

    if (currentLine && currentLine !== editorRef.current) {
      if (currentLine.querySelector('.task-checkbox') !== null) {
        return;
      }
    }

    const checkboxSpan = document.createElement('span');
    checkboxSpan.className = 'task-checkbox cursor-pointer select-none text-forest-600 font-mono inline-block mr-1.5';
    checkboxSpan.setAttribute('contenteditable', 'false');
    checkboxSpan.innerText = '⬜';

    const textSpan = document.createElement('span');
    textSpan.className = 'task-text';
    textSpan.innerHTML = '&#8203;';

    range.deleteContents();

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

  // Centralized save function
  const saveNodeData = async (isAutosave: boolean = false) => {
    if (!title.trim()) return null;

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
        
        setLocalActiveId(newId);
        lastLoadedIdRef.current = newId;
        onSelectSeedling?.(newId);
        setIsDirty(false);
        return newId;
      }
    } catch (err) {
      console.error("Failed to save note:", err);
    } finally {
      setIsSaving(false);
    }
    return null;
  };

  const handleGoBack = async () => {
    if (isDirty && title.trim()) {
      await saveNodeData(true);
    }
    onBack();
  };

  // Debounced Autosave effect
  useEffect(() => {
    if (!isDirty || !title.trim()) return;

    const timer = setTimeout(() => {
      saveNodeData(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, [title, content, tagsInput, status, isTask, isCompleted, isDirty]);

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
      setIsDeleteModalOpen(false);
      onBack();
    }
  };

  // Drag and drop image handlers
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
    if (!file.type.startsWith('image/')) return;

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

        if (!response.ok) throw new Error('Upload failed');

        const data = await response.json();
        if (data.url) {
          const htmlImage = `<img src="${data.url}" alt="${file.name}" referrerPolicy="no-referrer" />`;
          insertHtmlAtCursor(htmlImage);
          if (editorRef.current) {
            setContent(editorRef.current.innerHTML);
            setIsDirty(true);
          }
        }
      } catch (err) {
        const htmlImage = `<img src="${base64Data}" alt="${file.name}" referrerPolicy="no-referrer" />`;
        insertHtmlAtCursor(htmlImage);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex-1 h-full min-h-[calc(100vh-73px)] flex flex-col bg-white relative animate-fade-in">
      <style>{`
        .rich-editor h1 {
          font-family: inherit;
          font-size: 1.75rem;
          font-weight: 700;
          color: #0f172a;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
          line-height: 1.25;
        }
        .rich-editor h2 {
          font-family: inherit;
          font-size: 1.35rem;
          font-weight: 700;
          color: #1e293b;
          margin-top: 1.25rem;
          margin-bottom: 0.5rem;
          line-height: 1.3;
        }
        .rich-editor h3 {
          font-family: inherit;
          font-size: 1.15rem;
          font-weight: 600;
          color: #334155;
          margin-top: 1rem;
          margin-bottom: 0.5rem;
        }
        .rich-editor p {
          font-size: 0.95rem;
          color: #334155;
          line-height: 1.7;
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
          border-left: 3px solid #10b981;
          padding-left: 1rem;
          font-style: italic;
          color: #475569;
          background-color: #f8fafc;
          border-radius: 0 6px 6px 0;
          padding-top: 0.5rem;
          padding-bottom: 0.5rem;
          margin: 1.25rem 0;
        }
        .rich-editor img {
          max-height: 360px;
          max-width: 100%;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          display: block;
          margin: 1.25rem 0;
        }
        .rich-editor code {
          font-family: monospace;
          background-color: #f1f5f9;
          color: #0f172a;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 0.85rem;
        }
        .rich-editor:empty::before {
          content: attr(placeholder);
          color: #94a3b8;
          pointer-events: none;
        }
      `}</style>

      {/* Header Bar */}
      <div className="bg-white border-b border-slate-200/80 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4 sticky top-0 z-20">
        
        {/* Left Action: Back & Status */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleGoBack}
            className="p-2 hover:bg-slate-100 text-slate-600 hover:text-slate-900 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
            id="btn_editor_back"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go Back</span>
          </button>

          <div className="h-4 w-[1px] bg-slate-200 hidden sm:block" />

          {/* Auto-save Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200/60 text-[10px] font-mono font-semibold text-slate-600">
            <span className={`w-1.5 h-1.5 rounded-full ${isSaving ? 'bg-amber-500 animate-pulse' : isDirty ? 'bg-rose-500' : 'bg-emerald-500'}`} />
            <span>{isSaving ? 'SAVING' : isDirty ? 'UNSAVED' : 'SAVED'}</span>
          </div>
        </div>

        {/* Right Actions: Type, Status & Delete */}
        <div className="flex items-center gap-2">
          
          {/* Note vs Task Pill */}
          <button
            type="button"
            onClick={() => {
              setIsTask(!isTask);
              setIsDirty(true);
            }}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              isTask
                ? 'bg-forest-50 border-forest-200 text-forest-700'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            {isTask ? <CheckSquare className="w-3.5 h-3.5" /> : <FileText className="w-3.5 h-3.5" />}
            <span>{isTask ? 'Task' : 'Note'}</span>
          </button>

          {/* Task Completion Checkbox toggle (only when isTask) */}
          {isTask && (
            <button
              type="button"
              onClick={() => {
                setIsCompleted(!isCompleted);
                setIsDirty(true);
              }}
              title={isCompleted ? "Mark Pending" : "Mark Done"}
              className={`px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                isCompleted 
                  ? 'bg-emerald-600 border-emerald-600 text-white' 
                  : 'bg-amber-50/80 border-amber-200/80 text-amber-700 hover:bg-amber-100/80'
              }`}
            >
              {isCompleted ? (
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              ) : (
                <Clock className="w-3.5 h-3.5 shrink-0 text-amber-600" />
              )}
              <span className="hidden sm:inline">{isCompleted ? 'Done' : 'Pending'}</span>
            </button>
          )}

          {/* Archive Status Toggle */}
          <button
            type="button"
            onClick={() => {
              const newStatus = status === 'archived' ? 'active' : 'archived';
              setStatus(newStatus);
              setIsDirty(true);
            }}
            className={`p-2 rounded-xl border transition-colors cursor-pointer ${
              status === 'archived'
                ? 'bg-amber-50 border-amber-200 text-amber-700'
                : 'bg-white border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-50'
            }`}
            title={status === 'archived' ? 'Unarchive Note' : 'Archive Note'}
          >
            <Archive className="w-4 h-4" />
          </button>

          {/* Delete Button */}
          {(activeSeedlingId || localActiveId) && (
            <button
              onClick={handleDelete}
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
              title="Delete Note"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

        </div>

      </div>

      {/* Main Document Studio Container */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-8 max-w-4xl mx-auto w-full flex flex-col space-y-4">
        
        {/* Title Input */}
        <input
          ref={titleInputRef}
          type="text"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              if (editorRef.current) {
                editorRef.current.focus();
              }
            }
          }}
          placeholder="Note title..."
          className="font-display font-bold text-2xl sm:text-3xl text-slate-900 focus:outline-none w-full placeholder:text-slate-300 bg-transparent py-1 border-b border-transparent focus:border-slate-200 transition-colors"
        />

        {/* Tags Metadata Strip */}
        <div className="flex items-center gap-2 text-xs text-slate-500 pb-2 border-b border-slate-100">
          <Tag className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <input
            type="text"
            value={tagsInput}
            onChange={(e) => handleTagsChange(e.target.value)}
            placeholder="Add tags (separated by commas)..."
            className="bg-transparent focus:outline-none flex-1 text-slate-700 font-mono text-xs placeholder:text-slate-300"
          />
        </div>

        {/* Formatting Toolbar */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-1.5 flex flex-wrap items-center gap-1 sticky top-16 z-10 shadow-2xs">
          
          <button
            type="button"
            onClick={() => format('bold')}
            className="p-1.5 hover:bg-white text-slate-600 hover:text-slate-900 rounded-lg transition-colors cursor-pointer"
            title="Bold"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => format('italic')}
            className="p-1.5 hover:bg-white text-slate-600 hover:text-slate-900 rounded-lg transition-colors cursor-pointer"
            title="Italic"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => format('underline')}
            className="p-1.5 hover:bg-white text-slate-600 hover:text-slate-900 rounded-lg transition-colors cursor-pointer"
            title="Underline"
          >
            <Underline className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => format('strikeThrough')}
            className="p-1.5 hover:bg-white text-slate-600 hover:text-slate-900 rounded-lg transition-colors cursor-pointer"
            title="Strikethrough"
          >
            <Strikethrough className="w-4 h-4" />
          </button>

          <div className="w-[1px] h-4 bg-slate-200 mx-1" />

          <button
            type="button"
            onClick={() => format('insertUnorderedList')}
            className="p-1.5 hover:bg-white text-slate-600 hover:text-slate-900 rounded-lg transition-colors cursor-pointer"
            title="Bullet List"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => format('insertOrderedList')}
            className="p-1.5 hover:bg-white text-slate-600 hover:text-slate-900 rounded-lg transition-colors cursor-pointer"
            title="Numbered List"
          >
            <ListOrdered className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => formatBlock('<blockquote>')}
            className="p-1.5 hover:bg-white text-slate-600 hover:text-slate-900 rounded-lg transition-colors cursor-pointer"
            title="Quote Block"
          >
            <Quote className="w-4 h-4" />
          </button>

          <div className="w-[1px] h-4 bg-slate-200 mx-1" />

          <button
            type="button"
            onClick={insertTaskCheckbox}
            className="p-1.5 hover:bg-white text-slate-600 hover:text-slate-900 rounded-lg transition-colors cursor-pointer"
            title="Add Checkbox"
          >
            <CheckSquare className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={triggerFileInput}
            className="p-1.5 hover:bg-white text-slate-600 hover:text-slate-900 rounded-lg transition-colors cursor-pointer"
            title="Insert Image"
          >
            <ImageIcon className="w-4 h-4" />
          </button>

        </div>

        {/* Content Editable Body */}
        <div 
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          onClick={handleEditorClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`rich-editor flex-1 min-h-[400px] focus:outline-none text-left cursor-text relative pb-20 transition-all ${
            isDragging ? 'bg-forest-50/50 rounded-xl p-4 ring-2 ring-dashed ring-forest-400' : ''
          }`}
          style={{ outline: 'none' }}
          placeholder="Start writing or typing..."
        />

        {/* Hidden File Input for Image Upload */}
        <input 
          type="file" 
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />

      </div>

      {/* Delete Modal */}
      {isDeleteModalOpen && (() => {
        const cleanTitleForVerification = title
          .replace(/[\u1F600-\u1F64F]|[\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]/g, '')
          .replace(/\p{Emoji_Presentation}|\p{Extended_Pictographic}|\p{Emoji}/gu, '')
          .replace(/\s+/g, ' ')
          .trim() || 'delete';
        
        const isMatch = confirmTitleInput.trim().toLowerCase() === cleanTitleForVerification.toLowerCase();

        return (
          <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6 text-left space-y-4 shadow-xl">
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center text-rose-600 shrink-0">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">Delete Note</h3>
                  <p className="text-slate-500 text-xs">This action cannot be undone.</p>
                </div>
              </div>

              <p className="text-slate-600 text-xs leading-relaxed">
                To confirm deletion of <strong className="text-slate-900">"{title}"</strong>, type "<span className="text-rose-600 font-mono font-bold">{cleanTitleForVerification}</span>" below:
              </p>

              <input
                type="text"
                value={confirmTitleInput}
                onChange={(e) => setConfirmTitleInput(e.target.value)}
                placeholder="Type note title..."
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:border-rose-500 text-slate-800"
              />

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="px-4 py-2 hover:bg-slate-100 text-slate-600 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={executeDelete}
                  disabled={!isMatch}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isMatch
                      ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  }`}
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
