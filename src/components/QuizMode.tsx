import type { QuizQuestion, QuizResult } from "@/types";

interface QuizModeProps {
  currentQuestion: QuizQuestion | undefined;
  currentQuestionIndex: number;
  totalQuestions: number;
  currentAnswer: string | undefined;
  isSubmitted: boolean;
  onAnswerSelect: (answer: string) => void;
  onPrev: () => void;
  onExit: () => void;
  quizResult?: QuizResult;
  messages: {
    complete: string;
    summary: string;
    questions: string;
    correct: string;
    accuracy: string;
    excellent: string;
    good: string;
    keepPracticing: string;
    reviewFromBasics: string;
    review: string;
    pass: string;
    miss: string;
    correctLabel: string;
    yourAnswer: string;
    backToStudy: string;
    progress: string;
    chooseMeaning: string;
    previous: string;
    exit: string;
    autoAdvanceHint: string;
  };
}

const lightButtonClass =
  "rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-[0_12px_28px_-24px_rgba(15,23,42,0.4)] transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40";

export default function QuizMode({
  currentQuestion,
  currentQuestionIndex,
  totalQuestions,
  currentAnswer,
  isSubmitted,
  onAnswerSelect,
  onPrev,
  onExit,
  quizResult,
  messages,
}: QuizModeProps) {
  const progress =
    totalQuestions > 0
      ? ((currentQuestionIndex + 1) / totalQuestions) * 100
      : 0;

  if (isSubmitted && quizResult) {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <section className="rounded-[32px] border border-white/70 bg-white/88 p-6 shadow-[0_30px_72px_-52px_rgba(15,23,42,0.42)] backdrop-blur sm:p-8">
          <div className="mb-8 text-center">
            <div className="inline-flex items-center rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">
              Quiz
            </div>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900">
              {messages.complete}
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">{messages.summary}</p>
          </div>

          <div className="mb-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-[24px] border border-slate-200 bg-slate-50 px-5 py-4 text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                {messages.questions}
              </p>
              <p className="mt-2 text-3xl font-bold text-slate-900">
                {quizResult.totalQuestions}
              </p>
            </div>
            <div className="rounded-[24px] border border-emerald-200 bg-emerald-50 px-5 py-4 text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700">
                {messages.correct}
              </p>
              <p className="mt-2 text-3xl font-bold text-emerald-700">
                {quizResult.correctAnswers}
              </p>
            </div>
            <div className="rounded-[24px] border border-sky-200 bg-sky-50 px-5 py-4 text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-700">
                {messages.accuracy}
              </p>
              <p className="mt-2 text-3xl font-bold text-sky-700">
                {quizResult.accuracy}%
              </p>
            </div>
          </div>

          <div className="mb-8 rounded-[24px] border border-slate-200 bg-slate-50 px-5 py-4 text-center">
            {quizResult.accuracy >= 90 && (
              <p className="font-semibold text-emerald-700">{messages.excellent}</p>
            )}
            {quizResult.accuracy >= 70 && quizResult.accuracy < 90 && (
              <p className="font-semibold text-sky-700">{messages.good}</p>
            )}
            {quizResult.accuracy >= 50 && quizResult.accuracy < 70 && (
              <p className="font-semibold text-amber-700">{messages.keepPracticing}</p>
            )}
            {quizResult.accuracy < 50 && (
              <p className="font-semibold text-orange-700">{messages.reviewFromBasics}</p>
            )}
          </div>

          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">
              {messages.review}
            </p>
            {quizResult.questions.map((question, index) => (
              <div
                key={question.wordId}
                className={`rounded-[24px] border px-5 py-4 ${
                  question.isCorrect
                    ? "border-emerald-200 bg-emerald-50"
                    : "border-rose-200 bg-rose-50"
                }`}
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <span
                      className={`text-xs font-bold uppercase tracking-[0.24em] ${
                        question.isCorrect ? "text-emerald-700" : "text-rose-700"
                      }`}
                    >
                      {question.isCorrect ? messages.pass : messages.miss}
                    </span>
                    <div className="mt-2 text-lg font-semibold text-slate-900">
                      Q{index + 1}. {question.word}
                    </div>
                  </div>
                </div>
                <p className="mt-3 text-sm leading-7 text-slate-700">
                  <span className="font-semibold">{messages.correctLabel}:</span>{" "}
                  {question.correctAnswer}
                </p>
                {!question.isCorrect && (
                  <p className="text-sm leading-7 text-rose-700">
                    <span className="font-semibold">{messages.yourAnswer}:</span>{" "}
                    {question.userAnswer}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>

        <div className="flex justify-center">
          <button type="button" onClick={onExit} className={lightButtonClass}>
            {messages.backToStudy}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="rounded-[28px] border border-white/70 bg-white/88 p-5 shadow-[0_24px_60px_-50px_rgba(15,23,42,0.38)] backdrop-blur">
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm font-semibold text-slate-700">{messages.progress}</p>
          <p className="text-sm font-semibold text-slate-500">{Math.round(progress)}%</p>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-slate-900 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {currentQuestion && (
        <section className="rounded-[32px] border border-white/70 bg-white/88 p-6 shadow-[0_30px_72px_-52px_rgba(15,23,42,0.42)] backdrop-blur sm:p-8">
          <div className="mb-8">
            <div className="inline-flex items-center rounded-full border border-sky-100 bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">
              {messages.chooseMeaning}
            </div>
            <h2 className="mt-5 text-4xl font-bold tracking-tight text-slate-900">
              {currentQuestion.word}
            </h2>
          </div>

          <div className="mb-8 space-y-3">
            {currentQuestion.options.map((option, index) => (
              <button
                key={option}
                type="button"
                onClick={() => onAnswerSelect(option)}
                className={`w-full rounded-[22px] border px-4 py-4 text-left transition ${
                  currentAnswer === option
                    ? "border-slate-900 bg-slate-900 text-white shadow-[0_24px_50px_-30px_rgba(15,23,42,0.9)]"
                    : "border-slate-200 bg-slate-50/80 text-slate-700 hover:border-slate-300 hover:bg-white"
                }`}
              >
                <span className="mr-3 font-semibold">
                  {String.fromCharCode(65 + index)}.
                </span>
                <span>{option}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={onPrev}
              disabled={currentQuestionIndex === 0}
              className={lightButtonClass}
            >
              {messages.previous}
            </button>
            <p className="max-w-sm text-right text-sm leading-6 text-slate-500">
              {messages.autoAdvanceHint}
            </p>
          </div>
        </section>
      )}

      <div className="flex justify-center">
        <button
          type="button"
          onClick={onExit}
          className="text-sm font-semibold text-slate-500 transition hover:text-slate-800"
        >
          {messages.exit}
        </button>
      </div>
    </div>
  );
}
