import React from 'react';
import { playSound } from '../services/audioService';

const difficulties = ['Easy', 'Medium', 'Hard'];

interface DifficultySelectorProps {
  onSelectDifficulty: (difficulty: string) => void;
  onBack: () => void;
}

const DifficultySelector: React.FC<DifficultySelectorProps> = ({ onSelectDifficulty, onBack }) => {
  
  const handleDifficultyClick = (difficulty: string) => {
    playSound('select');
    onSelectDifficulty(difficulty);
  }

  return (
    <div className="w-full max-w-lg mx-auto text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 transition-colors">
      <h2 className="text-2xl font-semibold mb-6 text-gray-700 dark:text-gray-300">Choose Your Quiz Difficulty</h2>
      <div className="space-y-4 mb-6">
        {difficulties.map((difficulty) => (
          <button
            key={difficulty}
            onClick={() => handleDifficultyClick(difficulty)}
            className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-md shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            aria-label={`Select ${difficulty} difficulty`}
          >
            {difficulty}
          </button>
        ))}
      </div>
      <button
        onClick={onBack}
        className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 font-medium transition-colors"
      >
        &larr; Back to Flashcards
      </button>
    </div>
  );
};

export default DifficultySelector;