import FavoritesList from "@/components/FavoritesList";
import QuizMode from "@/components/QuizMode";
import { useFavorites } from "@/hooks/useFavorites";
import { useQuiz } from "@/hooks/useQuiz";
import type { Dictionary } from "@/i18n";
import type { DatasetKey, QuizResult, Word } from "@/types";
import { useDeferredValue, useEffect, useMemo, useState } from "react";

type ViewMode = "list" | "cards" | "favorites" | "quiz";

const primaryButtonClass =
  "rounded-full bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-40";

const secondaryButtonClass =
  "rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40";

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

  return (
    <div className="space-y-6">
      <header className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-700">
              {datasetInfo.learnerBadge}
            </p>
            <h1 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">
              {datasetInfo.learnerTitle}
            </h1>
            <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
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
      </header>

      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <input
            type="text"
            placeholder={dictionary.learner.searchPlaceholder}
            value={searchQuery}
            onChange={(event) => {
              setSearchQuery(event.target.value);
              setViewMode("list");
              setCurrentCardIndex(0);
            }}
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-500"
          />

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={viewMode === "list" ? primaryButtonClass : secondaryButtonClass}
            >
              {dictionary.learner.list}
            </button>
            <button
              type="button"
              onClick={() => {
                setViewMode("cards");
                setCurrentCardIndex(0);
              }}
              className={viewMode === "cards" ? primaryButtonClass : secondaryButtonClass}
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
        <section className="mx-auto max-w-3xl space-y-6">
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
                className="min-h-[360px] rounded-[32px] bg-gradient-to-br from-sky-700 to-indigo-700 p-8 text-white shadow-xl outline-none transition hover:translate-y-[-2px]"
              >
                <div className="flex h-full flex-col items-center justify-center text-center">
                  {!isFlipped ? (
                    <>
                      <p className="text-sm uppercase tracking-[0.2em] text-sky-100">
                        {dictionary.learner.word}
                      </p>
                      <h2 className="mt-6 text-4xl font-bold sm:text-5xl">
                        {currentCard.word}
                      </h2>
                      {currentCard.phonetic && (
                        <p className="mt-4 font-mono text-lg text-sky-100">
                          {currentCard.phonetic}
                        </p>
                      )}
                      <p className="mt-8 text-sm text-sky-100">
                        {dictionary.learner.revealMeaning}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm uppercase tracking-[0.2em] text-sky-100">
                        {dictionary.learner.meaning}
                      </p>
                      <p className="mt-6 text-2xl font-semibold sm:text-3xl">
                        {currentCard.meaning}
                      </p>
                      {currentCard.pos && (
                        <p className="mt-4 text-sm text-sky-100">{currentCard.pos}</p>
                      )}
                      <p className="mt-8 text-sm text-sky-100">
                        {dictionary.learner.returnWord}
                      </p>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => moveCard("prev")}
                  disabled={currentCardIndex === 0}
                  className={secondaryButtonClass}
                >
                  {dictionary.learner.previous}
                </button>

                <div className="flex-1 px-2">
                  <p className="text-center text-sm text-slate-600">
                    {currentCardIndex + 1} / {filteredWords.length}
                  </p>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-sky-600 transition-all"
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

              <div className="flex flex-wrap justify-center gap-3">
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
            </>
          ) : (
            <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
              <p className="text-slate-600">{dictionary.learner.noMatches}</p>
            </div>
          )}
        </section>
      ) : (
        <section className="space-y-6">
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="mb-4 text-sm font-semibold text-slate-700">
              {dictionary.learner.browseByLetter}
            </p>
            <div className="grid grid-cols-5 gap-2 sm:grid-cols-7 md:grid-cols-10 xl:grid-cols-[repeat(13,minmax(0,1fr))]">
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
                      ? primaryButtonClass
                      : secondaryButtonClass
                  }
                >
                  {letter}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-slate-700">{resultsLabel}</p>
          </div>

          <div className="grid gap-3">
            {filteredWords.map((word, index) => {
              const isFavorite = favorites.isFavorite(word.id);

              return (
                <article
                  key={word.id}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-sky-200 hover:shadow-md"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <h2 className="text-lg font-bold text-slate-900">{word.word}</h2>
                        {word.phonetic && (
                          <span className="font-mono text-sm text-sky-700">
                            {word.phonetic}
                          </span>
                        )}
                        {word.pos && (
                          <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">
                            {word.pos}
                          </span>
                        )}
                      </div>
                      <p className="mt-3 text-sm leading-6 text-slate-700">{word.meaning}</p>
                    </div>

                    <div className="flex flex-wrap gap-2">
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
              <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                <p className="text-slate-600">{dictionary.learner.noMatches}</p>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
