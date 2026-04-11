import {
  CloseIcon,
  HeartFilledIcon,
  VolumeIcon,
} from "@/components/Icons";
import type { Word } from "@/types";

interface FavoritesListProps {
  favorites: Word[];
  onRemoveFavorite: (wordId: number) => void;
  onPlayPronunciation: (word: string) => void;
  messages: {
    emptyTitle: string;
    emptyDescription: string;
    count: string;
    play: string;
    remove: string;
  };
}

const buttonClass =
  "inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-[0_12px_28px_-24px_rgba(15,23,42,0.4)] transition hover:border-slate-300 hover:bg-slate-50";

export default function FavoritesList({
  favorites,
  onRemoveFavorite,
  onPlayPronunciation,
  messages,
}: FavoritesListProps) {
  if (favorites.length === 0) {
    return (
      <div className="rounded-[30px] border border-white/70 bg-white/86 p-12 text-center shadow-[0_28px_64px_-50px_rgba(15,23,42,0.4)] backdrop-blur">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-rose-50 text-rose-500">
          <HeartFilledIcon className="h-6 w-6" />
        </div>
        <p className="text-xl font-semibold text-slate-900">{messages.emptyTitle}</p>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-500">
          {messages.emptyDescription}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 border-b border-slate-200/70 pb-3 text-sm font-semibold text-slate-700">
        <HeartFilledIcon className="h-4 w-4 text-rose-500" />
        <p>{messages.count}</p>
      </div>

      <div className="grid gap-4">
        {favorites.map((word) => (
          <article
            key={word.id}
            className="rounded-[28px] border border-white/70 bg-white/88 p-5 shadow-[0_22px_56px_-52px_rgba(15,23,42,0.45)] backdrop-blur transition hover:-translate-y-0.5 hover:shadow-[0_30px_70px_-52px_rgba(15,23,42,0.55)] sm:p-6"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-xl font-bold tracking-tight text-slate-900">
                    {word.word}
                  </h3>
                  {word.phonetic && (
                    <span className="rounded-full bg-slate-100 px-3 py-1 font-mono text-sm text-sky-700">
                      {word.phonetic}
                    </span>
                  )}
                  {word.pos && (
                    <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600">
                      {word.pos}
                    </span>
                  )}
                </div>
                <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-700 sm:text-[15px]">
                  {word.meaning}
                </p>
              </div>

              <div className="flex flex-wrap gap-2 lg:justify-end">
                <button
                  type="button"
                  onClick={() => onPlayPronunciation(word.word)}
                  className={buttonClass}
                >
                  <VolumeIcon className="h-4 w-4" />
                  {messages.play}
                </button>
                <button
                  type="button"
                  onClick={() => onRemoveFavorite(word.id)}
                  className={`${buttonClass} text-rose-600 hover:border-rose-200 hover:bg-rose-50`}
                >
                  <CloseIcon className="h-4 w-4" />
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
