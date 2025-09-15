import React, { useState } from 'react';
import type { TopicHistoryItem } from '../types';
import { playSound } from '../services/audioService';

const gradeLevels = ["Elementary School", "Middle School", "High School", "University"];

interface TopicInputProps {
  onSubmit: (topic: string, gradeLevel: string) => void;
  history: TopicHistoryItem[];
}

const TopicInput: React.FC<TopicInputProps> = ({ onSubmit, history }) => {
  const [topic, setTopic] = useState('');
  const [gradeLevel, setGradeLevel] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (topic.trim() && gradeLevel) {
      playSound('submit');
      onSubmit(topic.trim(), gradeLevel);
    }
  };

  const handleHistoryClick = (item: TopicHistoryItem) => {
    playSound('select');
    setTopic(item.topic);
    setGradeLevel(item.gradeLevel);
  };

  return (
    <div className="w-full max-w-lg mx-auto text-center">
      <h2 className="text-2xl font-semibold mb-4 text-gray-700 dark:text-gray-300">What would you like to learn about today?</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
            <label htmlFor="topic-input" className="sr-only">Learning Topic</label>
            <input
              id="topic-input"
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., 'Quantum Physics' or 'The Roman Empire'"
              className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
              aria-label="Learning topic"
            />
        </div>
        <div>
            <label htmlFor="grade-level-select" className="sr-only">Education Level</label>
            <select
              id="grade-level-select"
              value={gradeLevel}
              onChange={(e) => setGradeLevel(e.target.value)}
              className={`w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white ${gradeLevel ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}
              aria-label="Select education level"
            >
              <option value="" disabled>Select Education Level</option>
              {gradeLevels.map(level => (
                <option key={level} value={level} className="text-gray-900 dark:text-white">{level}</option>
              ))}
            </select>
        </div>
        <button
          type="submit"
          disabled={!topic.trim() || !gradeLevel}
          className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-md shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:dark:bg-gray-600 transition-colors"
        >
          Let's Go!
        </button>
      </form>

      {history && history.length > 0 && (
        <div className="mt-10 pt-6 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-semibold mb-4 text-gray-600 dark:text-gray-400">Recent Topics</h3>
          <div className="flex flex-wrap gap-3 justify-center">
            {history.map((item, index) => (
              <button
                key={`${item.topic}-${index}`}
                onClick={() => handleHistoryClick(item)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all text-sm shadow-sm dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                title={`Revisit ${item.topic} (${item.gradeLevel})`}
              >
                {item.topic}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TopicInput;