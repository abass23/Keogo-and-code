'use client';
import { useRef, useState, useCallback } from 'react';

/**
 * Shared hook for grammar exercise text inputs with virtual keyboard support.
 * Handles cursor-position-aware character insertion and deletion.
 */
export function useJapaneseInput(initialValue = '') {
  const [value, setValue] = useState(initialValue);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

  const insertChar = useCallback((char: string) => {
    const el = inputRef.current;
    if (!el) {
      setValue((v) => v + char);
      return;
    }

    const start = (el as HTMLInputElement).selectionStart ?? value.length;
    const end = (el as HTMLInputElement).selectionEnd ?? value.length;
    const next = value.slice(0, start) + char + value.slice(end);
    setValue(next);

    // Restore cursor after React re-renders the controlled input
    requestAnimationFrame(() => {
      const newPos = start + char.length;
      (el as HTMLInputElement).setSelectionRange(newPos, newPos);
      el.focus();
    });
  }, [value]);

  const deleteChar = useCallback(() => {
    const el = inputRef.current;
    if (!el) {
      setValue((v) => v.slice(0, -1));
      return;
    }

    const start = (el as HTMLInputElement).selectionStart ?? value.length;
    const end = (el as HTMLInputElement).selectionEnd ?? value.length;

    let next: string;
    let newPos: number;

    if (start !== end) {
      // Delete selection
      next = value.slice(0, start) + value.slice(end);
      newPos = start;
    } else if (start > 0) {
      // Delete one character before cursor
      next = value.slice(0, start - 1) + value.slice(start);
      newPos = start - 1;
    } else {
      return;
    }

    setValue(next);
    requestAnimationFrame(() => {
      (el as HTMLInputElement).setSelectionRange(newPos, newPos);
      el.focus();
    });
  }, [value]);

  const insertSpace = useCallback(() => insertChar('\u3000'), [insertChar]); // ideographic space

  function showKeyboard() { setKeyboardVisible(true); }
  function hideKeyboard() { setKeyboardVisible(false); }
  function toggleKeyboard() { setKeyboardVisible((v) => !v); }

  return {
    value,
    setValue,
    inputRef,
    keyboardVisible,
    showKeyboard,
    hideKeyboard,
    toggleKeyboard,
    insertChar,
    deleteChar,
    insertSpace,
  };
}
