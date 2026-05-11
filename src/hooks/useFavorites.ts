import { useEffect, useState } from "react";
import type { DatasetKey, Word } from "@/types";

const FAVORITES_KEY_PREFIX = "pep_vocab_favorites_v2";

function getFavoritesStorageKey(dataset: DatasetKey) {
  return `${FAVORITES_KEY_PREFIX}:${dataset}`;
}

function loadFavorites(dataset: DatasetKey) {
  if (typeof window === "undefined") {
    return new Set<number>();
  }

  try {
    const stored = window.localStorage.getItem(getFavoritesStorageKey(dataset));
    if (!stored) {
      return new Set<number>();
    }

    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) {
      return new Set<number>();
    }

    return new Set(
      parsed.filter((value): value is number => typeof value === "number")
    );
  } catch (error) {
    console.error("Failed to load favorites:", error);
    return new Set<number>();
  }
}

export function useFavorites(dataset: DatasetKey) {
  const [favorites, setFavorites] = useState<Set<number>>(() =>
    loadFavorites(dataset)
  );

  useEffect(() => {
    setFavorites(loadFavorites(dataset));
  }, [dataset]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(
      getFavoritesStorageKey(dataset),
      JSON.stringify(Array.from(favorites))
    );
  }, [dataset, favorites]);

  const toggleFavorite = (wordId: number) => {
    setFavorites((previous) => {
      const next = new Set(previous);

      if (next.has(wordId)) {
        next.delete(wordId);
      } else {
        next.add(wordId);
      }

      return next;
    });
  };

  const isFavorite = (wordId: number) => favorites.has(wordId);

  const getFavoriteWords = (words: Word[]) => {
    return words.filter((word) => favorites.has(word.id));
  };

  const exportFavoriteWords = (words: Word[]) => {
    const favoriteWords = getFavoriteWords(words);
    if (favoriteWords.length === 0) {
      return false;
    }

    const lines = favoriteWords.map((word) => {
      const parts = [word.word, word.phonetic, word.pos, word.meaning].filter(Boolean);
      return parts.join("\t");
    });
    const blob = new Blob([lines.join("\n") + "\n"], {
      type: "text/plain;charset=utf-8",
    });
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `pep-words-${dataset}-favorites.txt`;
    anchor.click();
    window.URL.revokeObjectURL(url);
    return true;
  };

  return {
    favorites,
    toggleFavorite,
    isFavorite,
    getFavoriteWords,
    exportFavoriteWords,
    favoriteCount: favorites.size,
  };
}
