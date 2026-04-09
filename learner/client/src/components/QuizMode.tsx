import type { QuizQuestion, QuizResult } from "@/types";

interface QuizModeProps {
  currentQuestion: QuizQuestion | undefined;
  currentQuestionIndex: number;
  totalQuestions: number;
  currentAnswer: string | undefined;
  isSubmitted: boolean;
  onAnswerSelect: (answer: string) => void;
  onNext: () => void;
  onPrev: () => void;
  onSubmit: () => void;
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
    next: string;
    submit: string;
    exit: string;
  };
}

export default function QuizMode({
  currentQuestion,
  currentQuestionIndex,
  totalQuestions,
  currentAnswer,
  isSubmitted,
  onAnswerSelect,
  onNext,
  onPrev,
  onSubmit,
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
      <div className="mx-auto max-w-3xl space-y-6">
        <section className="rounded-3xl border border-sky-200 bg-white p-8 shadow-sm">
          <div className="mb-8 text-center">
            <h2 className="mb-2 text-3xl font-bold text-slate-900">{messages.complete}</h2>
            <p className="text-slate-600">{messages.summary}</p>
          </div>

          <div className="mb-8 grid grid-cols-3 gap-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center">
              <p className="mb-1 text-sm text-slate-500">{messages.questions}</p>
              <p className="text-3xl font-bold text-slate-900">{quizResult.totalQuestions}</p>
            </div>
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-center">
              <p className="mb-1 text-sm text-emerald-700">{messages.correct}</p>
              <p className="text-3xl font-bold text-emerald-700">
                {quizResult.correctAnswers}
              </p>
            </div>
            <div className="rounded-2xl border border-sky-200 bg-sky-50 p-4 text-center">
              <p className="mb-1 text-sm text-sky-700">{messages.accuracy}</p>
              <p className="text-3xl font-bold text-sky-700">{quizResult.accuracy}%</p>
            </div>
          </div>

          <div className="mb-8 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            {quizResult.accuracy >= 90 && (
              <p className="text-center font-semibold text-emerald-700">{messages.excellent}</p>
            )}
            {quizResult.accuracy >= 70 && quizResult.accuracy < 90 && (
              <p className="text-center font-semibold text-sky-700">{messages.good}</p>
            )}
            {quizResult.accuracy >= 50 && quizResult.accuracy < 70 && (
              <p className="text-center font-semibold text-amber-700">
                {messages.keepPracticing}
              </p>
            )}
            {quizResult.accuracy < 50 && (
              <p className="text-center font-semibold text-orange-700">
                {messages.reviewFromBasics}
              </p>
            )}
          </div>

          <div className="space-y-3">
            <p className="mb-4 font-semibold text-slate-700">{messages.review}</p>
            {quizResult.questions.map((question, index) => (
              <div
                key={question.wordId}
                className={`rounded-2xl border p-4 ${
                  question.isCorrect
                    ? "border-emerald-200 bg-emerald-50"
                    : "border-rose-200 bg-rose-50"
                }`}
              >
                <div className="mb-2 flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-sm font-bold ${
                        question.isCorrect ? "text-emerald-700" : "text-rose-700"
                      }`}
                    >
                      {question.isCorrect ? messages.pass : messages.miss}
                    </span>
                    <span className="font-semibold text-slate-900">
                      Q{index + 1}. {question.word}
                    </span>
                  </div>
                </div>
                <p className="mb-2 text-sm text-slate-700">
                  <span className="font-semibold">{messages.correctLabel}:</span>{" "}
                  {question.correctAnswer}
                </p>
                {!question.isCorrect && (
                  <p className="text-sm text-rose-700">
                    <span className="font-semibold">{messages.yourAnswer}:</span>{" "}
                    {question.userAnswer}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>

        <div className="flex justify-center">
          <button
            type="button"
            onClick={onExit}
            className="rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
          >
            {messages.backToStudy}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-700">{messages.progress}</p>
          <p className="text-sm text-slate-600">{Math.round(progress)}%</p>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-sky-600 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {currentQuestion && (
        <section className="rounded-3xl border border-sky-200 bg-white p-8 shadow-sm">
          <div className="mb-8">
            <p className="mb-2 text-sm text-slate-600">{messages.chooseMeaning}</p>
            <h2 className="text-4xl font-bold text-slate-900">{currentQuestion.word}</h2>
          </div>

          <div className="mb-8 space-y-3">
            {currentQuestion.options.map((option, index) => (
              <button
                key={option}
                type="button"
                onClick={() => onAnswerSelect(option)}
                className={`w-full rounded-2xl border px-4 py-4 text-left transition ${
                  currentAnswer === option
                    ? "border-sky-600 bg-sky-600 text-white"
                    : "border-slate-200 bg-white text-slate-700 hover:border-sky-300 hover:bg-sky-50"
                }`}
              >
                <span className="mr-3 font-semibold">
                  {String.fromCharCode(65 + index)}.
                </span>
                <span>{option}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={onPrev}
              disabled={currentQuestionIndex === 0}
              className="rounded-full border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {messages.previous}
            </button>

            {currentQuestionIndex === totalQuestions - 1 ? (
              <button
                type="button"
                onClick={onSubmit}
                disabled={!currentAnswer}
                className="rounded-full bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {messages.submit}
              </button>
            ) : (
              <button
                type="button"
                onClick={onNext}
                disabled={!currentAnswer}
                className="rounded-full bg-sky-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {messages.next}
              </button>
            )}
          </div>
        </section>
      )}

      <div className="flex justify-center">
        <button
          type="button"
          onClick={onExit}
          className="text-sm font-semibold text-slate-500 transition hover:text-slate-700"
        >
          {messages.exit}
        </button>
      </div>
    </div>
  );
}
