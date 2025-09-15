import React, { useState, useEffect } from 'react';
import type { QuizQuestion } from '../types';
import { playSound } from '../services/audioService';

interface QuizTakerProps {
  quiz: QuizQuestion[];
  onSubmit: (answers: string[]) => void;
}

const QuizTaker: React.FC<QuizTakerProps> = ({ quiz, onSubmit }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>(new Array(quiz.length).fill(null));
  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewQueue, setReviewQueue] = useState<number[]>([]);
  const [showHint, setShowHint] = useState(false);

  const currentQuestion = quiz[currentIndex];

  useEffect(() => {
    setShowHint(false); // Reset hint visibility when question changes
  }, [currentIndex]);

  const handleAnswerSelect = (option: string) => {
    playSound('select');
    const newAnswers = [...answers];
    newAnswers[currentIndex] = option;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (isReviewing) {
      const currentQueueIndex = reviewQueue.indexOf(currentIndex);
      if (currentQueueIndex < reviewQueue.length - 1) {
        setCurrentIndex(reviewQueue[currentQueueIndex + 1]);
      }
    } else if (currentIndex < quiz.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (isReviewing) {
      const currentQueueIndex = reviewQueue.indexOf(currentIndex);
      if (currentQueueIndex > 0) {
        setCurrentIndex(reviewQueue[currentQueueIndex - 1]);
      }
    } else if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };
  
  const handleSubmit = () => {
    const unansweredIndices = answers
      .map((answer, index) => (answer === null ? index : -1))
      .filter(index => index !== -1);

    if (unansweredIndices.length > 0) {
      setIsReviewing(true);
      setReviewQueue(unansweredIndices);
      setCurrentIndex(unansweredIndices[0]);
    } else {
      playSound('submit');
      onSubmit(answers);
    }
  };
  
  const handleSkip = () => {
    if (!isReviewing) {
      if (currentIndex < quiz.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        // Skipping the last question is the same as submitting with it unanswered
        handleSubmit();
      }
    }
  };

  if (!quiz.length) {
    return <div>No quiz questions available.</div>;
  }

  let progressText: string;
  let progressPercentage: number;
  let isLastInSequence: boolean;
  let isFirstInSequence: boolean;

  if (isReviewing) {
    const currentQueueIndex = reviewQueue.indexOf(currentIndex);
    progressText = `Reviewing skipped question ${currentQueueIndex + 1} of ${reviewQueue.length}`;
    progressPercentage = ((currentQueueIndex + 1) / reviewQueue.length) * 100;
    isLastInSequence = currentQueueIndex === reviewQueue.length - 1;
    isFirstInSequence = currentQueueIndex === 0;
  } else {
    progressText = `Question ${currentIndex + 1} of ${quiz.length}`;
    progressPercentage = ((currentIndex + 1) / quiz.length) * 100;
    isLastInSequence = currentIndex === quiz.length - 1;
    isFirstInSequence = currentIndex === 0;
  }
  
  const canSubmit = answers.every(a => a !== null);
  const showSubmitButton = isLastInSequence || canSubmit;

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 transition-colors">
      <div className="mb-4">
        <div className="flex justify-between mb-1">
          <span className="text-base font-medium text-blue-700 dark:text-blue-400">{progressText}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
          <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-in-out" style={{ width: `${progressPercentage}%` }}></div>
        </div>
      </div>
      
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 flex-1">{currentQuestion.question}</h2>
        {currentQuestion.hint && !showHint && (
            <button 
                onClick={() => setShowHint(true)} 
                className="ml-4 px-3 py-1 text-sm font-medium text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:hover:bg-blue-900 whitespace-nowrap"
                aria-label="Show hint for this question"
            >
                Show Hint
            </button>
        )}
      </div>

      {showHint && currentQuestion.hint && (
        <div className="p-3 mb-4 bg-yellow-50 border border-yellow-300 rounded-lg text-yellow-800 text-sm dark:bg-yellow-900/20 dark:border-yellow-500/30 dark:text-yellow-300" role="alert">
            <span className="font-semibold">Hint:</span> {currentQuestion.hint}
        </div>
      )}
      
      <div className="space-y-4">
        {currentQuestion.options.map((option, index) => (
          <label key={index} className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${answers[currentIndex] === option ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500 dark:bg-gray-900/50 dark:border-blue-400' : 'border-gray-300 hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700'}`}>
            <input
              type="radio"
              name={`question-${currentIndex}`}
              value={option}
              checked={answers[currentIndex] === option}
              onChange={() => handleAnswerSelect(option)}
              className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
            />
            <span className="ml-3 text-md font-medium text-gray-900 dark:text-gray-200">{option}</span>
          </label>
        ))}
      </div>
      
      <div className="mt-8 flex justify-between items-center">
        <button onClick={handlePrev} disabled={isFirstInSequence} className="px-5 py-2.5 text-sm font-medium text-gray-900 bg-white rounded-lg border border-gray-200 hover:bg-gray-100 disabled:opacity-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600">
          Previous
        </button>

        {!isReviewing && !showSubmitButton && (
           <button onClick={handleSkip} className="px-5 py-2.5 text-sm font-medium text-gray-900 bg-yellow-400 rounded-lg hover:bg-yellow-500">
             Skip Question
           </button>
        )}
        
        {showSubmitButton ? (
          <button onClick={handleSubmit} className="px-5 py-2.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700">
            {canSubmit ? 'Submit Quiz' : 'Review & Submit'}
          </button>
        ) : (
          <button onClick={handleNext} disabled={answers[currentIndex] === null} className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-400">
            Next
          </button>
        )}
      </div>
    </div>
  );
};

export default QuizTaker;