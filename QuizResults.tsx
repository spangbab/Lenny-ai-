import React, { useEffect } from 'react';
import type { QuizQuestion } from '../types';
import RestartIcon from './icons/RestartIcon';
import { playSound } from '../services/audioService';

interface QuizResultsProps {
  quiz: QuizQuestion[];
  userAnswers: string[];
  score: number;
  onRestart: () => void;
  studyCount: number;
}

const QuizResults: React.FC<QuizResultsProps> = ({ quiz, userAnswers, score, onRestart, studyCount }) => {
  const scorePercentage = Math.round((score / quiz.length) * 100);

  useEffect(() => {
    playSound('complete');
  }, []); // Play sound only once when component mounts

  return (
    <div className="w-full max-w-3xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 transition-colors">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold fontPoppins text-gray-800 dark:text-gray-100">Quiz Complete!</h2>
        <p className="text-xl text-gray-600 dark:text-gray-300 mt-2">
          You scored <span className="font-bold text-blue-600 dark:text-blue-400">{score}</span> out of <span className="font-bold text-blue-600 dark:text-blue-400">{quiz.length}</span> ({scorePercentage}%)
        </p>
      </div>

      <div className="space-y-6">
        {quiz.map((question, index) => {
          const userAnswer = userAnswers[index];
          const isCorrect = userAnswer === question.correctAnswer;
          return (
            <div key={index} className={`p-4 rounded-lg border ${isCorrect ? 'bg-green-50 border-green-300 dark:bg-green-900/20 dark:border-green-500/30' : 'bg-red-50 border-red-300 dark:bg-red-900/20 dark:border-red-500/30'}`}>
              <p className="font-semibold text-gray-800 dark:text-gray-200">{index + 1}. {question.question}</p>
              <p className={`mt-2 text-sm ${isCorrect ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300'}`}>
                Your answer: <span className="font-medium">{userAnswer || 'Skipped'}</span> {isCorrect ? '✅' : '❌'}
              </p>
              {!isCorrect && (
                <p className="mt-1 text-sm text-green-800 dark:text-green-300">
                  Correct answer: <span className="font-medium">{question.correctAnswer}</span>
                </p>
              )}
               <div className="mt-2 pt-2 border-t border-gray-300/60 dark:border-gray-600/60">
                 {question.explanationImageUrl && (
                    <div className="my-3 rounded-md overflow-hidden border border-gray-200 bg-gray-50 dark:border-gray-600 dark:bg-gray-700">
                        <img 
                            src={question.explanationImageUrl} 
                            alt={`Illustration for: ${question.explanation}`}
                            className="w-full h-auto object-contain" 
                        />
                    </div>
                 )}
                 <p className="text-sm text-gray-700 dark:text-gray-300">
                    <span className="font-semibold">Explanation:</span> {question.explanation}
                 </p>
               </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 text-center">
        <p className="text-gray-600 dark:text-gray-400 mb-4">
            You've studied this topic <span className="font-bold text-gray-800 dark:text-gray-200">{studyCount}</span> time{studyCount !== 1 ? 's' : ''}. Keep up the great work!
        </p>
        <button
          onClick={onRestart}
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-md shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          <RestartIcon />
          Learn Another Topic
        </button>
      </div>
    </div>
  );
};

export default QuizResults;