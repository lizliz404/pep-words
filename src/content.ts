import type { DatasetKey, Word } from "@/types";

type Loader<T> = () => Promise<T>;
type WordEnrichment = Partial<Pick<Word, "phonetic" | "pos">>;

const markdownModules = import.meta.glob("./data/*.md", {
  query: "?raw",
  import: "default",
}) as Record<string, Loader<string>>;

const jsonModules = import.meta.glob("./data/*.json", {
  import: "default",
}) as Record<string, Loader<unknown>>;

const markdownCache = new Map<DatasetKey, Promise<string>>();
const wordsCache = new Map<DatasetKey, Promise<Word[]>>();

const DATASET_JSON_FILE: Record<DatasetKey, string> = {
  "primary-school": "primary_school.json",
  "middle-school": "middle_school.json",
};

const DATASET_ENRICHMENT_FILE: Record<DatasetKey, string> = {
  "primary-school": "primary_school.enrichment.json",
  "middle-school": "middle_school.enrichment.json",
};

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

function getWordsLoader(dataset: DatasetKey) {
  const fileName = DATASET_JSON_FILE[dataset];
  const entry = Object.entries(jsonModules).find(([filePath]) =>
    filePath.endsWith(fileName),
  );

  return requireLoader(entry?.[1], `${dataset} words`);
}

function getEnrichmentLoader(dataset: DatasetKey) {
  const fileName = DATASET_ENRICHMENT_FILE[dataset];
  const entry = Object.entries(jsonModules).find(([filePath]) =>
    filePath.endsWith(fileName),
  );

  return requireLoader(entry?.[1], `${dataset} enrichment`);
}

function applyEnrichment(
  words: Word[],
  enrichment: Record<string, WordEnrichment>,
): Word[] {
  return words.map((word) => {
    const patch = enrichment[word.id];
    if (!patch) {
      return word;
    }

    return {
      ...word,
      phonetic: word.phonetic || patch.phonetic || "",
      pos: word.pos || patch.pos || "",
    };
  });
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

  const pending = Promise.all([
    getWordsLoader(dataset)(),
    getEnrichmentLoader(dataset)(),
  ]).then(([wordsModule, enrichmentModule]) =>
    applyEnrichment(
      wordsModule as Word[],
      enrichmentModule as Record<string, WordEnrichment>,
    ),
  );
  wordsCache.set(dataset, pending);
  return pending;
}
