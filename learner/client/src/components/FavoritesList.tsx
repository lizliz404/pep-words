import type { Word } from "@/types";

interface FavoritesListProps {
  favorites: Word[];
  onRemoveFavorite: (wordId: number) => void;
  onPlayPronunciation: (word: string, phonetic: string) => void;
  messages: {
    emptyTitle: string;
    emptyDescription: string;
    count: string;
    play: string;
    remove: string;
  };
}

export default function FavoritesList({
  favorites,
  onRemoveFavorite,
  onPlayPronunciation,
  messages,
}: FavoritesListProps) {
  if (favorites.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <p className="text-lg font-semibold text-slate-800">{messages.emptyTitle}</p>
        <p className="mt-2 text-sm text-slate-500">{messages.emptyDescription}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-slate-700">{messages.count}</p>

      <div className="grid gap-3">
        {favorites.map((word) => (
          <article
            key={word.id}
            className="rounded-2xl border border-rose-100 bg-rose-50/50 p-4 shadow-sm transition hover:border-rose-200 hover:shadow-md"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-lg font-bold text-slate-900">{word.word}</h3>
                  {word.phonetic && (
                    <span className="font-mono text-sm text-sky-700">
                      {word.phonetic}
                    </span>
                  )}
                  {word.pos && (
                    <span className="rounded-full bg-white px-2 py-1 text-xs font-semibold text-slate-600">
                      {word.pos}
                    </span>
                  )}
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-700">{word.meaning}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => onPlayPronunciation(word.word, word.phonetic)}
                  className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-sky-300 hover:text-sky-700"
                >
                  {messages.play}
                </button>
                <button
                  type="button"
                  onClick={() => onRemoveFavorite(word.id)}
                  className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-rose-600 transition hover:border-rose-300 hover:bg-rose-50"
                >
                  {messages.remove}
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
