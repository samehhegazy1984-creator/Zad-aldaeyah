import React from 'react';

/**
 * Normalizes Arabic text by:
 * 1. Removing Tashkeel (diacritics like Fathah, Dammah, Kasrah, Sukun, Tanween, Shaddah).
 * 2. Unifying Alef forms (أ, إ, آ, ٱ -> ا).
 * 3. Unifying Yaa and Alef Maqsura (ى, ي -> ي).
 * 4. Unifying Taa Marbuta and Haa (ة, ه -> ه).
 * 5. Removing Tatweel / Kashida (ـ).
 * 6. Trimming and normalizing whitespace.
 */
export function normalizeArabic(text: string): string {
  if (!text) return '';

  return (
    text
      // Remove diacritics / Tashkeel
      .replace(/[\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E8\u06EA-\u06ED]/g, '')
      // Remove Tatweel / Kashida
      .replace(/\u0640/g, '')
      // Normalize Alef forms: أ, إ, آ, ٱ -> ا
      .replace(/[أإآٱ]/g, 'ا')
      // Normalize Yaa & Alef Maqsura: ى, ي -> ي
      .replace(/[ىي]/g, 'ي')
      // Normalize Taa Marbuta & Haa: ة, ه -> ه
      .replace(/[ةه]/g, 'ه')
      // Lowercase for any Latin characters
      .toLowerCase()
      // Collapse spaces
      .replace(/\s+/g, ' ')
      .trim()
  );
}

/**
 * Checks if a target text matches a search query using Arabic normalization.
 */
export function matchesArabicSearch(targetText: string, searchQuery: string): boolean {
  if (!searchQuery.trim()) return true;
  if (!targetText) return false;

  const normalizedTarget = normalizeArabic(targetText);
  const normalizedQuery = normalizeArabic(searchQuery);

  // Check full query match
  if (normalizedTarget.includes(normalizedQuery)) {
    return true;
  }

  // Check individual words
  const queryTokens = normalizedQuery.split(' ').filter(Boolean);
  return queryTokens.every((token) => normalizedTarget.includes(token));
}

/**
 * Splits text into highlighted and non-highlighted segments based on search query.
 */
export function getHighlightedText(
  text: string,
  searchQuery: string
): { text: string; isMatch: boolean }[] {
  if (!searchQuery.trim() || !text) {
    return [{ text, isMatch: false }];
  }

  const queryTokens = normalizeArabic(searchQuery)
    .split(' ')
    .filter((t) => t.length > 1);

  if (queryTokens.length === 0) {
    return [{ text, isMatch: false }];
  }

  // Create regex pattern matching variations of normalized tokens
  // E.g. for "ابناء" match [أإآا]بن[اآ][ءه]?
  try {
    const pattern = queryTokens
      .map((t) => {
        let p = '';
        for (const char of t) {
          if (char === 'ا') p += '[اأإآٱ]';
          else if (char === 'ي') p += '[ييى]';
          else if (char === 'ه') p += '[ههة]';
          else p += char;
        }
        return `(${p})`;
      })
      .join('|');

    const regex = new RegExp(pattern, 'gi');
    const segments: { text: string; isMatch: boolean }[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        segments.push({
          text: text.substring(lastIndex, match.index),
          isMatch: false,
        });
      }
      segments.push({
        text: match[0],
        isMatch: true,
      });
      lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
      segments.push({
        text: text.substring(lastIndex),
        isMatch: false,
      });
    }

    return segments.length > 0 ? segments : [{ text, isMatch: false }];
  } catch (err) {
    return [{ text, isMatch: false }];
  }
}
