import type { DatasetKey, Word } from "@/types";

type Loader<T> = () => Promise<T>;

const markdownModules = import.meta.glob("./data/*.md", {
  query: "?raw",
  import: "default",
}) as Record<string, Loader<string>>;

const jsonModules = import.meta.glob("./data/*.json", {
  import: "default",
}) as Record<string, Loader<unknown>>;

const markdownCache = new Map<DatasetKey, Promise<string>>();
const wordsCache = new Map<DatasetKey, Promise<Word[]>>();

const primaryListItemPattern = /^(\d+)\.\s+\*\*(.+?)\*\*(.*)$/;
const phoneticPattern = /^(\/.*?\/|\[.*?\])\s*(.*)$/;
const posPattern = /^([A-Za-z][A-Za-z.&/\-\s]*\.)\s*,\s*(.*)$/;

function normalizeField(value: string) {
  if (value === "-" || value === "-." || value === "*-*") {
    return "";
  }

  return value.trim();
}

function requireLoader<T>(loader: Loader<T> | undefined, label: string) {
  if (!loader) {
    throw new Error(`Missing loader for ${label}`);
  }

  return loader;
}

function getMarkdownLoader(dataset: DatasetKey) {
  const marker = dataset === "middle-school" ? "(A-Z).md" : "3-6";
  const entry = Object.entries(markdownModules).find(([filePath]) =>
    filePath.includes(marker),
  );

  return requireLoader(entry?.[1], `${dataset} markdown`);
}

function getMiddleSchoolWordsLoader() {
  const entry = Object.entries(jsonModules).find(([filePath]) =>
    filePath.endsWith("words.json"),
  );

  return requireLoader(entry?.[1], "middle-school words");
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

export function loadDatasetMarkdown(dataset: DatasetKey): Promise<string> {
  const cached = markdownCache.get(dataset);
  if (cached) {
    return cached;
  }

  const pending = getMarkdownLoader(dataset)();
  markdownCache.set(dataset, pending);
  return pending;
}

export function loadDatasetWords(dataset: DatasetKey): Promise<Word[]> {
  const cached = wordsCache.get(dataset);
  if (cached) {
    return cached;
  }

  const pending =
    dataset === "middle-school"
      ? getMiddleSchoolWordsLoader()().then((module) => module as Word[])
      : loadDatasetMarkdown("primary-school").then(parsePrimarySchoolWords);

  wordsCache.set(dataset, pending);
  return pending;
}
