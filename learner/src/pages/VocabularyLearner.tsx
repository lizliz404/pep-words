import FavoritesList from "@/components/FavoritesList";
import QuizMode from "@/components/QuizMode";
import { useFavorites } from "@/hooks/useFavorites";
import { useQuiz } from "@/hooks/useQuiz";
import type { Dictionary } from "@/i18n";
import type { DatasetKey, QuizResult, Word } from "@/types";
import { useDeferredValue, useEffect, useMemo, useState } from "react";

type ViewMode = "list" | "cards" | "favorites" | "quiz";

const primaryButtonClass =
  "rounded-full bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_18px_34px_-22px_rgba(15,23,42,0.9)] transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40";

const secondaryButtonClass =
  "rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-[0_12px_28px_-24px_rgba(15,23,42,0.4)] transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40";

const activeChipClass =
  "rounded-full border border-slate-900 bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-[0_14px_28px_-24px_rgba(15,23,42,0.85)] transition";

const inactiveChipClass =
  "rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900";

interface VocabularyLearnerProps {
  dataset: DatasetKey;
  words: Word[];
  dictionary: Dictionary;
}

export default function VocabularyLearner({
  dataset,
  words,
  dictionary,
}: VocabularyLearnerProps) {
  const datasetInfo = dictionary.datasets[dataset];
  const favorites = useFavorites(dataset);
  const quiz = useQuiz();

  const [searchQuery, setSearchQuery] = useState("");
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const [selectedLetter, setSelectedLetter] = useState(words[0]?.letter ?? "A");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);

  const letters = useMemo(() => {
    return Array.from(new Set(words.map((word) => word.letter))).sort();
  }, [words]);

  const filteredWords = useMemo(() => {
    const query = deferredSearchQuery.trim().toLowerCase();

    if (query) {
      return words.filter((word) => {
        return (
          word.word.toLowerCase().includes(query) ||
          word.meaning.toLowerCase().includes(query)
        );
      });
    }

    return words.filter((word) => word.letter === selectedLetter);
  }, [deferredSearchQuery, selectedLetter, words]);

  useEffect(() => {
    if (!letters.includes(selectedLetter) && letters.length > 0) {
      setSelectedLetter(letters[0]);
    }
  }, [letters, selectedLetter]);

  useEffect(() => {
    if (currentCardIndex >= filteredWords.length) {
      setCurrentCardIndex(0);
    }

    setIsFlipped(false);
  }, [currentCardIndex, filteredWords.length]);

  const favoriteWords = favorites.getFavoriteWords(words);
  const currentCard = filteredWords[currentCardIndex];

  const startQuiz = () => {
    if (filteredWords.length === 0) {
      return;
    }

    quiz.generateQuiz(filteredWords, Math.min(10, filteredWords.length));
    setQuizResult(null);
    setViewMode("quiz");
  };

  const submitQuiz = () => {
    setQuizResult(quiz.submitQuiz());
  };

  const exitQuiz = () => {
    quiz.exitQuiz();
    setQuizResult(null);
    setViewMode("list");
  };

  const playPronunciation = (word: string) => {
    if (!("speechSynthesis" in window)) {
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = "en-US";
    window.speechSynthesis.speak(utterance);
  };

  const moveCard = (direction: "prev" | "next") => {
    setCurrentCardIndex((index) => {
      if (direction === "prev") {
        return Math.max(0, index - 1);
      }

      return Math.min(filteredWords.length - 1, index + 1);
    });
  };

  const cardProgress =
    filteredWords.length > 0
      ? ((currentCardIndex + 1) / filteredWords.length) * 100
      : 0;

  const resultsLabel = deferredSearchQuery.trim()
    ? dictionary.learner.searchResults(filteredWords.length)
    : dictionary.learner.letterResults(selectedLetter, filteredWords.length);

  const metaCards = [
    {
      label: dictionary.learner.words,
      value: words.length.toLocaleString(),
    },
    {
      label: dictionary.learner.visible,
      value: filteredWords.length.toLocaleString(),
    },
    {
      label: dictionary.learner.favorites,
      value: favorites.favoriteCount.toLocaleString(),
    },
    {
      label: dictionary.learner.mode,
      value:
        viewMode === "favorites"
          ? dictionary.learner.favoritesButton(favorites.favoriteCount)
          : viewMode === "cards"
            ? dictionary.learner.cards
            : viewMode === "quiz"
              ? dictionary.learner.startQuiz
              : dictionary.learner.list,
    },
  ];

  return (
    <div className="space-y-6">
      <header className="overflow-hidden rounded-[32px] border border-white/70 bg-white/86 p-6 shadow-[0_28px_70px_-48px_rgba(15,23,42,0.4)] backdrop-blur sm:p-8">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="inline-flex items-center rounded-full border border-sky-100 bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">
                {datasetInfo.learnerBadge}
              </div>
              <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                {datasetInfo.learnerTitle}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                {datasetInfo.learnerDescription}
              </p>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => {
                  setViewMode("favorites");
                  setQuizResult(null);
                }}
                className={secondaryButtonClass}
              >
                {dictionary.learner.favoritesButton(favorites.favoriteCount)}
              </button>
              <button
                type="button"
                onClick={startQuiz}
                disabled={filteredWords.length === 0}
                className={primaryButtonClass}
              >
                {dictionary.learner.startQuiz}
              </button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {metaCards.map((card) => (
              <div
                key={card.label}
                className="rounded-2xl border border-slate-200/80 bg-slate-50/80 px-4 py-3"
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                  {card.label}
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-900">{card.value}</p>
              </div>
            ))}
          </div>
        </div>
      </header>

      <section className="rounded-[32px] border border-white/70 bg-white/86 p-5 shadow-[0_24px_60px_-50px_rgba(15,23,42,0.38)] backdrop-blur sm:p-6">
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-center">
          <div className="space-y-3">
            <label className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
              {dictionary.learner.search}
            </label>
            <input
              type="text"
              placeholder={dictionary.learner.searchPlaceholder}
              value={searchQuery}
              onChange={(event) => {
                setSearchQuery(event.target.value);
                setViewMode("list");
                setCurrentCardIndex(0);
              }}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/85 px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-300 focus:bg-white"
            />
            <p className="text-sm font-medium text-slate-500">{resultsLabel}</p>
          </div>

          <div className="flex flex-wrap gap-2 xl:justify-end">
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={viewMode === "list" ? activeChipClass : inactiveChipClass}
            >
              {dictionary.learner.list}
            </button>
            <button
              type="button"
              onClick={() => {
                setViewMode("cards");
                setCurrentCardIndex(0);
              }}
              className={viewMode === "cards" ? activeChipClass : inactiveChipClass}
            >
              {dictionary.learner.cards}
            </button>
          </div>
        </div>
      </section>

      {viewMode === "quiz" ? (
        <QuizMode
          currentQuestion={quiz.currentQuestion}
          currentQuestionIndex={quiz.currentQuestionIndex}
          totalQuestions={quiz.questions.length}
          currentAnswer={quiz.currentAnswer}
          isSubmitted={quiz.isSubmitted}
          onAnswerSelect={quiz.answerQuestion}
          onNext={quiz.nextQuestion}
          onPrev={quiz.prevQuestion}
          onSubmit={submitQuiz}
          onExit={exitQuiz}
          quizResult={quizResult ?? undefined}
          messages={{
            ...dictionary.quiz,
            progress: dictionary.quiz.progress(
              quiz.currentQuestionIndex + 1,
              quiz.questions.length
            ),
          }}
        />
      ) : viewMode === "favorites" ? (
        <FavoritesList
          favorites={favoriteWords}
          onRemoveFavorite={favorites.toggleFavorite}
          onPlayPronunciation={(word) => playPronunciation(word)}
          messages={{
            emptyTitle: dictionary.favorites.emptyTitle,
            emptyDescription: dictionary.favorites.emptyDescription,
            count: dictionary.favorites.count(favoriteWords.length),
            play: dictionary.favorites.play,
            remove: dictionary.favorites.remove,
          }}
        />
      ) : viewMode === "cards" ? (
        <section className="mx-auto max-w-4xl space-y-6">
          {currentCard ? (
            <>
              <div
                role="button"
                tabIndex={0}
                onClick={() => setIsFlipped((value) => !value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setIsFlipped((value) => !value);
                  }
                }}
                className="relative min-h-[380px] overflow-hidden rounded-[34px] border border-slate-200/70 bg-[linear-gradient(145deg,#0f172a_0%,#1e293b_56%,#155e75_100%)] p-8 text-white shadow-[0_34px_90px_-56px_rgba(15,23,42,0.95)] outline-none transition hover:-translate-y-0.5"
              >
                <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.18),transparent_60%)]" />
                <div className="relative flex h-full flex-col items-center justify-center text-center">
                  {!isFlipped ? (
                    <>
                      <div className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.26em] text-sky-100">
                        {dictionary.learner.word}
                      </div>
                      <h2 className="mt-7 text-4xl font-bold tracking-tight sm:text-5xl">
                        {currentCard.word}
                      </h2>
                      {currentCard.phonetic && (
                        <p className="mt-4 rounded-full bg-white/10 px-4 py-2 font-mono text-base text-sky-100 sm:text-lg">
                          {currentCard.phonetic}
                        </p>
                      )}
                      <p className="mt-9 text-sm text-sky-100/90">
                        {dictionary.learner.revealMeaning}
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.26em] text-sky-100">
                        {dictionary.learner.meaning}
                      </div>
                      <p className="mt-7 max-w-2xl text-2xl font-semibold leading-10 sm:text-3xl">
                        {currentCard.meaning}
                      </p>
                      {currentCard.pos && (
                        <p className="mt-5 rounded-full bg-white/10 px-4 py-2 text-sm text-sky-100">
                          {currentCard.pos}
                        </p>
                      )}
                      <p className="mt-9 text-sm text-sky-100/90">
                        {dictionary.learner.returnWord}
                      </p>
                    </>
                  )}
                </div>
              </div>

              <div className="rounded-[28px] border border-white/70 bg-white/86 p-5 shadow-[0_24px_60px_-50px_rgba(15,23,42,0.36)] backdrop-blur">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    type="button"
                    onClick={() => moveCard("prev")}
                    disabled={currentCardIndex === 0}
                    className={secondaryButtonClass}
                  >
                    {dictionary.learner.previous}
                  </button>

                  <div className="flex-1 px-1">
                    <div className="flex items-center justify-between text-sm font-medium text-slate-500">
                      <span>{currentCardIndex + 1}</span>
                      <span>{filteredWords.length}</span>
                    </div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="h-full rounded-full bg-slate-900 transition-all"
                        style={{ width: `${cardProgress}%` }}
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => moveCard("next")}
                    disabled={currentCardIndex === filteredWords.length - 1}
                    className={secondaryButtonClass}
                  >
                    {dictionary.learner.next}
                  </button>
                </div>

                <div className="mt-5 flex flex-wrap justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => playPronunciation(currentCard.word)}
                    className={primaryButtonClass}
                  >
                    {dictionary.learner.playPronunciation}
                  </button>
                  <button
                    type="button"
                    onClick={() => favorites.toggleFavorite(currentCard.id)}
                    className={secondaryButtonClass}
                  >
                    {favorites.isFavorite(currentCard.id)
                      ? dictionary.learner.saved
                      : dictionary.learner.save}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="rounded-[28px] border border-white/70 bg-white/86 p-10 text-center shadow-[0_24px_60px_-50px_rgba(15,23,42,0.36)] backdrop-blur">
              <p className="text-slate-600">{dictionary.learner.noMatches}</p>
            </div>
          )}
        </section>
      ) : (
        <section className="space-y-6">
          <div className="rounded-[32px] border border-white/70 bg-white/86 p-5 shadow-[0_24px_60px_-50px_rgba(15,23,42,0.36)] backdrop-blur sm:p-6">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
              {dictionary.learner.browseByLetter}
            </p>
            <div className="flex flex-wrap gap-2">
              {letters.map((letter) => (
                <button
                  key={letter}
                  type="button"
                  onClick={() => {
                    setSelectedLetter(letter);
                    setSearchQuery("");
                    setViewMode("list");
                    setCurrentCardIndex(0);
                  }}
                  className={
                    selectedLetter === letter && searchQuery === ""
                      ? activeChipClass
                      : inactiveChipClass
                  }
                >
                  {letter}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4">
            {filteredWords.map((word, index) => {
              const isFavorite = favorites.isFavorite(word.id);

              return (
                <article
                  key={word.id}
                  className="rounded-[28px] border border-white/70 bg-white/88 p-5 shadow-[0_22px_56px_-52px_rgba(15,23,42,0.45)] backdrop-blur transition hover:-translate-y-0.5 hover:shadow-[0_28px_64px_-50px_rgba(15,23,42,0.55)] sm:p-6"
                  style={{ contentVisibility: "auto" }}
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <h2 className="text-xl font-bold tracking-tight text-slate-900">
                          {word.word}
                        </h2>
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
                        onClick={() => {
                          setCurrentCardIndex(index);
                          setViewMode("cards");
                          setIsFlipped(false);
                        }}
                        className={secondaryButtonClass}
                      >
                        {dictionary.learner.openCard}
                      </button>
                      <button
                        type="button"
                        onClick={() => playPronunciation(word.word)}
                        className={secondaryButtonClass}
                      >
                        {dictionary.learner.playPronunciation}
                      </button>
                      <button
                        type="button"
                        onClick={() => favorites.toggleFavorite(word.id)}
                        className={isFavorite ? primaryButtonClass : secondaryButtonClass}
                      >
                        {isFavorite ? dictionary.learner.saved : dictionary.learner.save}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}

            {filteredWords.length === 0 && (
              <div className="rounded-[28px] border border-white/70 bg-white/86 p-10 text-center shadow-[0_24px_60px_-50px_rgba(15,23,42,0.36)] backdrop-blur">
                <p className="text-slate-600">{dictionary.learner.noMatches}</p>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
