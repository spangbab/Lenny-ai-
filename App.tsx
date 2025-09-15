import React, { useState, useCallback, useEffect } from 'react';
import { AppState } from './constants';
import type { Flashcard, QuizQuestion, TopicHistoryItem } from './types';
import { generateFlashcards, generateQuiz } from './services/geminiService';
import TopicInput from './components/TopicInput';
import FlashcardViewer from './components/FlashcardViewer';
import QuizTaker from './components/QuizTaker';
import QuizResults from './components/QuizResults';
import LoadingSpinner from './components/LoadingSpinner';
import DifficultySelector from './components/DifficultySelector';
import FeedbackButton from './components/FeedbackButton';
import Logo from './components/Logo';
import ThemeToggleButton from './components/ThemeToggleButton';
import InstallPWAButton from './components/InstallPWAButton';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.INPUT);
  const [topic, setTopic] = useState<string>('');
  const [gradeLevel, setGradeLevel] = useState<string>('');
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [formulas, setFormulas] = useState<string[]>([]);
  const [quiz, setQuiz] = useState<QuizQuestion[]>([]);
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  const [score, setScore] = useState<number>(0);
  const [history, setHistory] = useState<TopicHistoryItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('theme') as 'light' | 'dark') || 'light';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem('studyHistory');
      if (storedHistory) {
        const parsedHistory = JSON.parse(storedHistory);
        if (Array.isArray(parsedHistory)) {
          // Ensure all history items have a count for backward compatibility
          const historyWithCounts = parsedHistory.map((item: any) => ({
            ...item,
            count: item.count || 1,
          }));
          setHistory(historyWithCounts);
        }
      }
    } catch (e) {
      console.error("Failed to load history from localStorage", e);
    }
  }, []);

  const resetApp = () => {
    setAppState(AppState.INPUT);
    setTopic('');
    setGradeLevel('');
    setFlashcards([]);
    setFormulas([]);
    setQuiz([]);
    setUserAnswers([]);
    setScore(0);
    setError(null);
  };

  const handleTopicSubmit = useCallback(async (submittedTopic: string, submittedGradeLevel: string) => {
    setTopic(submittedTopic);
    setGradeLevel(submittedGradeLevel);
    setAppState(AppState.GENERATING_FLASHCARDS);
    setError(null);
    try {
      const { flashcards: generatedFlashcards, formulas: generatedFormulas } = await generateFlashcards(submittedTopic, submittedGradeLevel);
      setFlashcards(generatedFlashcards);
      setFormulas(generatedFormulas);
      setAppState(AppState.VIEWING_FLASHCARDS);

      setHistory(prevHistory => {
        const existingItemIndex = prevHistory.findIndex(
            h => h.topic.toLowerCase() === submittedTopic.toLowerCase() && h.gradeLevel === submittedGradeLevel
        );

        let updatedHistory;

        if (existingItemIndex > -1) {
            // Item exists, update count and move to front
            const existingItem = prevHistory[existingItemIndex];
            const updatedItem = { ...existingItem, count: (existingItem.count || 0) + 1 };
            updatedHistory = [
                updatedItem,
                ...prevHistory.slice(0, existingItemIndex),
                ...prevHistory.slice(existingItemIndex + 1)
            ];
        } else {
            // New item, add to front with count 1
            const newHistoryItem = { topic: submittedTopic, gradeLevel: submittedGradeLevel, count: 1 };
            updatedHistory = [newHistoryItem, ...prevHistory];
        }
        
        const finalHistory = updatedHistory.slice(0, 10);
        
        try {
          localStorage.setItem('studyHistory', JSON.stringify(finalHistory));
        } catch (e) {
          console.error("Failed to save history to localStorage", e);
        }
        return finalHistory;
      });

    } catch (err) {
      setError('Failed to generate flashcards. Please try again.');
      setAppState(AppState.INPUT);
    }
  }, []);

  const handleStartQuiz = useCallback(() => {
    setAppState(AppState.SELECTING_DIFFICULTY);
  }, []);
  
  const handleDifficultySelect = useCallback(async (difficulty: string) => {
    setAppState(AppState.GENERATING_QUIZ);
    setError(null);
    try {
      const generatedQuiz = await generateQuiz(topic, gradeLevel, difficulty);
      setQuiz(generatedQuiz);
      setUserAnswers(new Array(generatedQuiz.length).fill(''));
      setAppState(AppState.TAKING_QUIZ);
    } catch (err) {
      setError('Failed to generate the quiz. Please try again.');
      setAppState(AppState.SELECTING_DIFFICULTY);
    }
  }, [topic, gradeLevel]);

  const handleQuizSubmit = (finalAnswers: string[]) => {
    let newScore = 0;
    quiz.forEach((q, index) => {
        if (q.correctAnswer === finalAnswers[index]) {
            newScore++;
        }
    });
    setScore(newScore);
    setUserAnswers(finalAnswers);
    setAppState(AppState.QUIZ_RESULTS);
  };

  const renderContent = () => {
    switch (appState) {
      case AppState.INPUT:
        return <TopicInput onSubmit={handleTopicSubmit} history={history} />;
      case AppState.GENERATING_FLASHCARDS:
        return <LoadingSpinner message="Generating your flashcards and images..." />;
      case AppState.VIEWING_FLASHCARDS:
        return <FlashcardViewer flashcards={flashcards} formulas={formulas} onStartQuiz={handleStartQuiz} onQuit={resetApp} />;
      case AppState.SELECTING_DIFFICULTY:
        return <DifficultySelector onSelectDifficulty={handleDifficultySelect} onBack={() => setAppState(AppState.VIEWING_FLASHCARDS)} />;
      case AppState.GENERATING_QUIZ:
        return <LoadingSpinner message="Crafting your quiz..." />;
      case AppState.TAKING_QUIZ:
        return <QuizTaker quiz={quiz} onSubmit={handleQuizSubmit} />;
      case AppState.QUIZ_RESULTS:
        const currentHistoryItem = history.find(
          h => h.topic.toLowerCase() === topic.toLowerCase() && h.gradeLevel === gradeLevel
        );
        return (
            <QuizResults 
                quiz={quiz} 
                userAnswers={userAnswers} 
                score={score} 
                onRestart={resetApp}
                studyCount={currentHistoryItem?.count ?? 1}
            />
        );
      default:
        return <TopicInput onSubmit={handleTopicSubmit} history={history} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 dark:bg-gray-900 dark:text-gray-200 flex flex-col items-center justify-center p-4 transition-colors duration-300">
       <div className="w-full max-w-4xl mx-auto flex flex-col min-h-[80vh]">
        <div className="flex justify-between items-start mb-4">
          <Logo />
          <div className="flex items-center gap-4">
            <InstallPWAButton />
            <ThemeToggleButton theme={theme} onToggle={toggleTheme} />
          </div>
        </div>
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold fontPoppins text-gray-800 dark:text-white">
            Lenny AI
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 mt-2">
            Your personal AI-powered learning assistant.
          </p>
        </header>
        <main className="flex-grow flex items-center justify-center">
          <div className="w-full">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md relative mb-6" role="alert">
                <strong className="font-bold">Error: </strong>
                <span className="block sm:inline">{error}</span>
              </div>
            )}
            {renderContent()}
          </div>
        </main>
      </div>
      <FeedbackButton />
    </div>
  );
};

export default App;