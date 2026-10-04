import { useState, useEffect, useCallback } from 'react';
import { ReadingHistoryItem, Content } from '../types';
import { CONTENT_DATABASE } from '../data/content';

const HISTORY_KEY = 'zad_reading_history';
const MAX_HISTORY_ITEMS = 10;

export function useReadingHistory() {
  const [history, setHistory] = useState<ReadingHistoryItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(HISTORY_KEY);
        if (stored) {
          return JSON.parse(stored);
        }
      } catch (e) {
        console.error('Failed to load reading history', e);
      }
    }
    return [];
  });

  const recordVisit = useCallback((contentId: string) => {
    setHistory((prev) => {
      // Remove any existing entry for this item
      const filtered = prev.filter((item) => item.contentId !== contentId);
      // Prepend newest
      const updated = [{ contentId, timestamp: Date.now() }, ...filtered].slice(
        0,
        MAX_HISTORY_ITEMS
      );

      try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save reading history', e);
      }
      return updated;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    try {
      localStorage.removeItem(HISTORY_KEY);
    } catch (e) {
      console.error('Failed to clear reading history', e);
    }
  }, []);

  // Map history to full Content items
  const recentContents: Content[] = history
    .map((item) => CONTENT_DATABASE.find((c) => c.id === item.contentId))
    .filter((c): c is Content => c !== undefined);

  return {
    history,
    recentContents,
    recordVisit,
    clearHistory,
  };
}
