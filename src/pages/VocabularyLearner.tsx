import {
  CardsIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  GridIcon,
  HeartFilledIcon,
  HeartIcon,
  ListIcon,
  QuizIcon,
  SearchIcon,
  VolumeIcon,
} from "@/components/Icons";
import FavoritesList from "@/components/FavoritesList";
import QuizMode from "@/components/QuizMode";
import { useFavorites } from "@/hooks/useFavorites";
import { useQuiz } from "@/hooks/useQuiz";
import type { Dictionary } from "@/i18n";
import type { DatasetKey, QuizResult, Word } from "@/types";
import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";

type ViewMode = "list" | "cards" | "favorites" | "quiz";

//  Apple/Linear Style Buttons: Clean, subtle scaling, precise borders
const primaryButtonClass =
  "inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:bg-slate-800 hover:shadow-md active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40";

const secondaryButtonClass =
  "inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition-all duration-200 hover:border-slate-300 hover:bg-slate-50 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40";

const activeChipClass =
  "inline-flex items-center justify-center min-w-[2.5rem] h-10 rounded-lg bg-slate-900 px-4 text-sm font-medium text-white shadow-sm transition-all duration-200";

const inactiveChipClass =
  "inline-flex items-center justify-center min-w-[2.5rem] h-10 rounded-lg bg-transparent px-4 text-sm font-medium text-slate-500 transition-all duration-200 hover:bg-slate-100 hover:text-slate-900";

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
  const autoAdvanceTimerRef = useRef<number | null>(null);

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

  useEffect(() => {
    return () => {
      if (autoAdvanceTimerRef.current !== null) {
        window.clearTimeout(autoAdvanceTimerRef.current);
      }
    };
  }, []);

  const clearAutoAdvanceTimer = () => {
    if (autoAdvanceTimerRef.current !== null) {
      window.clearTimeout(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = null;
    }
  };

  const favoriteWords = favorites.getFavoriteWords(words);
  const currentCard = filteredWords[currentCardIndex];

  const startQuiz = () => {
    if (filteredWords.length === 0) return;
    clearAutoAdvanceTimer();
    quiz.generateQuiz(filteredWords, Math.min(10, filteredWords.length));
    setQuizResult(null);
    setViewMode("quiz");
  };

  const submitQuiz = () => {
    clearAutoAdvanceTimer();
    setQuizResult(quiz.submitQuiz());
  };

  const exitQuiz = () => {
    clearAutoAdvanceTimer();
    quiz.exitQuiz();
    setQuizResult(null);
    setViewMode("list");
  };

  const handleQuizAnswerSelect = (answer: string) => {
    clearAutoAdvanceTimer();
    quiz.answerQuestion(answer);

    const isLastQuestion =
      quiz.currentQuestionIndex === quiz.questions.length - 1;

    autoAdvanceTimerRef.current = window.setTimeout(() => {
      autoAdvanceTimerRef.current = null;

      if (isLastQuestion) {
        submitQuiz();
        return;
      }

      quiz.nextQuestion();
    }, 220);
  };

  const playPronunciation = (word: string) => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = "en-US";
    window.speechSynthesis.speak(utterance);
  };

  const moveCard = (direction: "prev" | "next") => {
    setCurrentCardIndex((index) => {
      if (direction === "prev") return Math.max(0, index - 1);
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

  const stats = [
    { label: dictionary.learner.words, value: words.length.toLocaleString() },
    { label: dictionary.learner.visible, value: filteredWords.length.toLocaleString() },
    { label: dictionary.learner.favorites, value: favorites.favoriteCount.toLocaleString() },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-10 font-sans text-slate-900 pb-20">
      {/* 优雅的头部区域 */}
      <header className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between pt-8">
        <div className="max-w-2xl space-y-4">
          <div className="inline-flex items-center rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
            {datasetInfo.learnerBadge}
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            {datasetInfo.learnerTitle}
          </h1>
          <p className="text-base leading-relaxed text-slate-500">
            {datasetInfo.learnerDescription}
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-2 pt-2 text-sm">
            {stats.map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                <span className="text-slate-400">{item.label}</span>
                <span className="font-medium text-slate-900">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => {
              clearAutoAdvanceTimer();
              setViewMode("favorites");
              setQuizResult(null);
            }}
            className={secondaryButtonClass}
          >
            {favorites.favoriteCount > 0 ? (
              <HeartFilledIcon className="h-[18px] w-[18px] text-rose-500" />
            ) : (
              <HeartIcon className="h-[18px] w-[18px] text-slate-500" />
            )}
            {dictionary.learner.favoritesButton(favorites.favoriteCount)}
          </button>
          <button
            type="button"
            onClick={startQuiz}
            disabled={filteredWords.length === 0}
            className={primaryButtonClass}
          >
            <QuizIcon className="h-[18px] w-[18px]" />
            {dictionary.learner.startQuiz}
          </button>
        </div>
      </header>

      {/* 极简的工具栏：搜索与视图切换 */}
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-md">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
            <SearchIcon className="h-5 w-5" />
          </div>
          <input
            id={`search-${dataset}`}
            type="text"
            placeholder={dictionary.learner.searchPlaceholder}
            value={searchQuery}
            onChange={(event) => {
              setSearchQuery(event.target.value);
              setViewMode("list");
              setCurrentCardIndex(0);
            }}
            className="block w-full rounded-xl border-0 bg-slate-100 py-3 pl-11 pr-4 text-sm text-slate-900 transition-all placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-slate-400 hidden sm:block">{resultsLabel}</span>
          
          {/* iOS风格的分段控制器 */}
          <div className="flex items-center rounded-xl bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                viewMode === "list"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <ListIcon className="h-4 w-4" />
              {dictionary.learner.list}
            </button>
            <button
              type="button"
              onClick={() => {
                setViewMode("cards");
                setCurrentCardIndex(0);
              }}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                viewMode === "cards"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <GridIcon className="h-4 w-4" />
              {dictionary.learner.cards}
            </button>
          </div>
        </div>
      </section>

      {/* 主体内容区 */}
      {viewMode === "quiz" ? (
        <QuizMode
          currentQuestion={quiz.currentQuestion}
          currentQuestionIndex={quiz.currentQuestionIndex}
          totalQuestions={quiz.questions.length}
          currentAnswer={quiz.currentAnswer}
          isSubmitted={quiz.isSubmitted}
          onAnswerSelect={handleQuizAnswerSelect}
          onPrev={() => {
            clearAutoAdvanceTimer();
            quiz.prevQuestion();
          }}
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
        <section className="mx-auto max-w-3xl space-y-8">
          {currentCard ? (
            <>
              {/* 高端卡片设计：摒弃花哨渐变，采用纯净的大量留白与精致排版 */}
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
                className="group relative flex min-h-[440px] w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-10 text-center shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-slate-100"
              >
                {!isFlipped ? (
                  <div className="flex flex-col items-center animate-in fade-in zoom-in-95 duration-200">
                    <span className="mb-8 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold tracking-widest text-slate-400">
                      {dictionary.learner.word}
                    </span>
                    <h2 className="text-5xl font-bold tracking-tight text-slate-900 sm:text-6xl">
                      {currentCard.word}
                    </h2>
                    {currentCard.phonetic && (
                      <p className="mt-6 font-mono text-lg text-slate-400">
                        {currentCard.phonetic}
                      </p>
                    )}
                    <p className="absolute bottom-8 text-sm text-slate-400 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      {dictionary.learner.revealMeaning}
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center animate-in fade-in zoom-in-95 duration-200">
                    <span className="mb-8 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold tracking-widest text-slate-400">
                      {dictionary.learner.meaning}
                    </span>
                    <p className="max-w-xl text-2xl font-medium leading-relaxed text-slate-800 sm:text-3xl">
                      {currentCard.meaning}
                    </p>
                    {currentCard.pos && (
                      <span className="mt-8 rounded-md border border-slate-200 bg-slate-50 px-3 py-1 text-sm font-medium text-slate-500">
                        {currentCard.pos}
                      </span>
                    )}
                    <p className="absolute bottom-8 text-sm text-slate-400 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      {dictionary.learner.returnWord}
                    </p>
                  </div>
                )}
              </div>

              {/* 卡片控制台 */}
              <div className="flex flex-col gap-6 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => playPronunciation(currentCard.word)}
                    className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-colors hover:bg-slate-200 hover:text-slate-900"
                    aria-label={dictionary.learner.playPronunciation}
                  >
                    <VolumeIcon className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => favorites.toggleFavorite(currentCard.id)}
                    className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-colors hover:bg-rose-50 hover:text-rose-500"
                    aria-label={dictionary.learner.save}
                  >
                    {favorites.isFavorite(currentCard.id) ? (
                      <HeartFilledIcon className="h-5 w-5 text-rose-500" />
                    ) : (
                      <HeartIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>

                <div className="flex flex-1 items-center gap-4 px-4 sm:px-8">
                  <span className="text-sm font-medium text-slate-400 tabular-nums">
                    {currentCardIndex + 1}
                  </span>
                  <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="absolute inset-y-0 left-0 rounded-full bg-slate-900 transition-all duration-300 ease-out"
                      style={{ width: `${cardProgress}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-slate-400 tabular-nums">
                    {filteredWords.length}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => moveCard("prev")}
                    disabled={currentCardIndex === 0}
                    className={secondaryButtonClass}
                  >
                    <ChevronLeftIcon className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveCard("next")}
                    disabled={currentCardIndex === filteredWords.length - 1}
                    className={secondaryButtonClass}
                  >
                    <ChevronRightIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-[2rem] border border-dashed border-slate-200 bg-slate-50 py-24 text-center">
              <SearchIcon className="mb-4 h-8 w-8 text-slate-300" />
              <p className="text-lg font-medium text-slate-600">{dictionary.learner.noMatches}</p>
            </div>
          )}
        </section>
      ) : (
        <section className="space-y-8">
          {/* 字母索引栏 */}
          <div className="flex flex-wrap gap-1 border-b border-slate-100 pb-6">
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

          {/* 列表视图 */}
          <div className="grid gap-4">
            {filteredWords.map((word, index) => {
              const isFavorite = favorites.isFavorite(word.id);

              return (
                <article
                  key={word.id}
                  className="group flex flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-6 transition-all hover:border-slate-300 hover:shadow-sm sm:flex-row sm:items-start sm:justify-between"
                  style={{ contentVisibility: "auto" }}
                >
                  <div className="min-w-0 flex-1 space-y-3">
                    <div className="flex items-baseline gap-3">
                      <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                        {word.word}
                      </h2>
                      {word.phonetic && (
                        <span className="font-mono text-sm text-slate-400">
                          {word.phonetic}
                        </span>
                      )}
                      {word.pos && (
                        <span className="ml-2 rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
                          {word.pos}
                        </span>
                      )}
                    </div>
                    <p className="text-base leading-relaxed text-slate-600">
                      {word.meaning}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100 focus-within:opacity-100">
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentCardIndex(index);
                        setViewMode("cards");
                        setIsFlipped(false);
                      }}
                      className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
                      aria-label={dictionary.learner.openCard}
                    >
                      <CardsIcon className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => playPronunciation(word.word)}
                      className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
                      aria-label={dictionary.learner.playPronunciation}
                    >
                      <VolumeIcon className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => favorites.toggleFavorite(word.id)}
                      className={`flex h-10 w-10 items-center justify-center rounded-xl transition-colors ${
                        isFavorite
                          ? "bg-rose-50 text-rose-500 hover:bg-rose-100"
                          : "bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                      }`}
                      aria-label={isFavorite ? dictionary.learner.saved : dictionary.learner.save}
                    >
                      {isFavorite ? (
                        <HeartFilledIcon className="h-5 w-5" />
                      ) : (
                        <HeartIcon className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </article>
              );
            })}

            {filteredWords.length === 0 && (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-20 text-center">
                <SearchIcon className="mb-4 h-8 w-8 text-slate-300" />
                <p className="text-slate-500">{dictionary.learner.noMatches}</p>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}