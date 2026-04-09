import middleSchoolMarkdown from "@/data/初中英语单词汇总 (A-Z).md?raw";
import primarySchoolMarkdown from "@/data/人教版 PEP 小学英语单词汇总 (3-6年级).md?raw";
import middleSchoolWordsData from "@/data/words.json";
import type { DatasetKey, Word } from "@/types";

const primaryListItemPattern = /^(\d+)\.\s+\*\*(.+?)\*\*(.*)$/;
const phoneticPattern = /^(\/.*?\/|\[.*?\])\s*(.*)$/;
const posPattern = /^([A-Za-z][A-Za-z.&/\-\s]*\.)\s*,\s*(.*)$/;

function normalizeField(value: string) {
  if (value === "-" || value === "-." || value === "*-*") {
    return "";
  }

  return value.trim();
}

function parsePrimarySchoolWords(markdown: string): Word[] {
  const words: Word[] = [];
  let currentLetter = "A";

  for (const rawLine of markdown.split(/\r?\n/)) {
    const line = rawLine.trim();

    if (!line) {
      continue;
    }

    if (line.startsWith("## ")) {
      currentLetter = line.slice(3).trim();
      continue;
    }

    const match = line.match(primaryListItemPattern);
    if (!match) {
      continue;
    }

    const [, idText, wordText, trailingText] = match;
    let remainder = trailingText.trim();
    let phonetic = "";
    let pos = "";

    const phoneticMatch = remainder.match(phoneticPattern);
    if (phoneticMatch) {
      phonetic = normalizeField(phoneticMatch[1]);
      remainder = phoneticMatch[2].trim();
    }

    const posMatch = remainder.match(posPattern);
    if (posMatch) {
      pos = normalizeField(posMatch[1]);
      remainder = posMatch[2].trim();
    }

    words.push({
      id: Number(idText),
      word: wordText.trim(),
      phonetic,
      pos,
      meaning: remainder,
      letter: currentLetter,
    });
  }

  return words;
}

export const middleSchoolWords = middleSchoolWordsData as Word[];
export const primarySchoolWords = parsePrimarySchoolWords(primarySchoolMarkdown);

export const datasetWords: Record<DatasetKey, Word[]> = {
  "middle-school": middleSchoolWords,
  "primary-school": primarySchoolWords,
};

export const datasetMarkdown: Record<DatasetKey, string> = {
  "middle-school": middleSchoolMarkdown,
  "primary-school": primarySchoolMarkdown,
};
