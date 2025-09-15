import React, { useState } from 'react';
import type { Flashcard } from '../types';
import ChevronLeftIcon from './icons/ChevronLeftIcon';
import ChevronRightIcon from './icons/ChevronRightIcon';
import { playSound } from '../services/audioService';

interface FlashcardViewerProps {
  flashcards: Flashcard[];
  formulas: string[];
  onStartQuiz: () => void;
  onQuit: () => void;
}

const FlashcardViewer: React.FC<FlashcardViewerProps> = ({ flashcards, formulas, onStartQuiz, onQuit }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const hasFormulas = formulas && formulas.length > 0;
  const totalItems = flashcards.length + (hasFormulas ? 1 : 0);
  
  const handleNext = () => {
    if (currentIndex < totalItems - 1 && !isAnimating) {
        playSound('navigate');
        setIsAnimating(true);
        setTimeout(() => {
            setCurrentIndex(currentIndex + 1);
            setIsAnimating(false);
        }, 150);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0 && !isAnimating) {
        playSound('navigate');
        setIsAnimating(true);
        setTimeout(() => {
            setCurrentIndex(currentIndex - 1);
            setIsAnimating(false);
        }, 150);
    }
  };
  
  const handleStartQuizClick = () => {
    playSound('submit');
    onStartQuiz();
  }

  if (!flashcards.length) {
    return <div>No flashcards available.</div>;
  }

  const isLastCard = currentIndex === totalItems - 1;
  const isFormulaCard = hasFormulas && currentIndex === flashcards.length;

  const renderCardContent = () => {
    if (isFormulaCard) {
      return (
        <div className="p-6 flex-grow flex flex-col">
          <h3 className="text-2xl md:text-3xl font-bold fontPoppins text-gray-800 dark:text-gray-100 mb-4 pb-3 border-b border-gray-200 dark:border-gray-600">
            Important Formulas & Takeaways
          </h3>
          <ul className="text-lg text-gray-700 dark:text-gray-300 flex-grow space-y-3 list-disc pl-5">
            {formulas.map((formula, index) => (
              <li key={index}>{formula}</li>
            ))}
          </ul>
        </div>
      );
    }

    const currentFlashcard = flashcards[currentIndex];
    return (
      <>
        {currentFlashcard.imageUrl ? (
            <div className="w-full h-56 bg-gray-200 dark:bg-gray-700 rounded-t-xl overflow-hidden">
            <img src={currentFlashcard.imageUrl} alt={`Illustration for ${currentFlashcard.heading}`} className="w-full h-full object-contain" />
            </div>
        ) : (
            <div className="w-full h-8 bg-gray-100 dark:bg-gray-700 rounded-t-xl"></div>
        )}
        <div className="p-6 flex-grow flex flex-col">
            <h3 className="text-2xl md:text-3xl font-bold fontPoppins text-gray-800 dark:text-gray-100 mb-4 pb-3 border-b border-gray-200 dark:border-gray-600">
            {currentFlashcard.heading}
            </h3>
            <p className="text-lg text-gray-700 dark:text-gray-300 flex-grow whitespace-pre-line">
            {currentFlashcard.information}
            </p>
        </div>
      </>
    );
  };

  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-full max-w-2xl">
        <div className="w-full min-h-[25rem] bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 flex flex-col text-left mb-4 overflow-hidden transition-colors">
          {renderCardContent()}
        </div>

        <p className="text-center text-gray-500 dark:text-gray-400 mb-4">
          Item {currentIndex + 1} of {totalItems}
        </p>

        <div className="flex justify-between items-center">
          <button onClick={handlePrev} disabled={currentIndex === 0 || isAnimating} className="p-3 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors dark:bg-gray-700 dark:hover:bg-gray-600">
            <ChevronLeftIcon />
          </button>
          
          {isLastCard ? (
            <div className="flex items-center gap-4">
              <button onClick={onQuit} className="px-6 py-3 bg-red-600 text-white font-semibold rounded-md shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors">
                Quit
              </button>
              <button onClick={handleStartQuizClick} className="px-6 py-3 bg-green-600 text-white font-semibold rounded-md shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors">
                Ready for a Quiz!
              </button>
            </div>
          ) : (
             <div className="w-48 h-12"></div> // Placeholder to maintain layout
          )}
          
          <button onClick={handleNext} disabled={isLastCard || isAnimating} className="p-3 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors dark:bg-gray-700 dark:hover:bg-gray-600">
            <ChevronRightIcon />
          </button>
        </div>
      </div>
    </div>
  );
};

export default FlashcardViewer;