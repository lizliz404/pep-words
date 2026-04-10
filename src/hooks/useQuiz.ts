import { useState } from "react";
import type { QuizQuestion, QuizResult, Word } from "@/types";

export function useQuiz() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [answers, setAnswers] = useState<Map<number, string>>(new Map());
  const [isSubmitted, setIsSubmitted] = useState(false);

  const generateQuiz = (words: Word[], questionCount: number = 10) => {
    const shuffled = [...words].sort(() => Math.random() - 0.5);
    const selectedWords = shuffled.slice(0, Math.min(questionCount, words.length));

    const quizQuestions: QuizQuestion[] = selectedWords.map((word) => {
      const wrongAnswers = shuffled
        .filter((candidate) => candidate.id !== word.id)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map((candidate) => candidate.meaning);

      const options = [word.meaning, ...wrongAnswers].sort(
        () => Math.random() - 0.5
      );

      return {
        wordId: word.id,
        word: word.word,
        correctAnswer: word.meaning,
        options,
      };
    });

    setQuestions(quizQuestions);
    setCurrentQuestionIndex(0);
    setAnswers(new Map());
    setIsSubmitted(false);
  };

  const answerQuestion = (answer: string) => {
    setAnswers((previous) => {
      const next = new Map(previous);
      next.set(currentQuestionIndex, answer);
      return next;
    });
  };

  const nextQuestion = () => {
    setCurrentQuestionIndex((previous) =>
      previous < questions.length - 1 ? previous + 1 : previous
    );
  };

  const prevQuestion = () => {
    setCurrentQuestionIndex((previous) => (previous > 0 ? previous - 1 : previous));
  };

  const submitQuiz = (): QuizResult => {
    let correctCount = 0;
    const resultQuestions = questions.map((question, index) => {
      const userAnswer = answers.get(index);
      const isCorrect = userAnswer === question.correctAnswer;

      if (isCorrect) {
        correctCount += 1;
      }

      return {
        ...question,
        userAnswer,
        isCorrect,
      };
    });

    setIsSubmitted(true);

    return {
      totalQuestions: questions.length,
      correctAnswers: correctCount,
      accuracy:
        questions.length === 0
          ? 0
          : Math.round((correctCount / questions.length) * 100),
      questions: resultQuestions,
    };
  };

  const exitQuiz = () => {
    setCurrentQuestionIndex(0);
    setQuestions([]);
    setAnswers(new Map());
    setIsSubmitted(false);
  };

  const currentQuestion = questions[currentQuestionIndex];
  const currentAnswer = answers.get(currentQuestionIndex);

  return {
    currentQuestionIndex,
    questions,
    currentQuestion,
    currentAnswer,
    isSubmitted,
    generateQuiz,
    answerQuestion,
    nextQuestion,
    prevQuestion,
    submitQuiz,
    exitQuiz,
  };
}
