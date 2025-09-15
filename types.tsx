export interface Flashcard {
  heading: string;
  information: string;
  imageUrl?: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  hint?: string;
  explanationImageUrl?: string;
}

export interface FlashcardData {
  flashcards: Flashcard[];
  formulas: string[];
}

export interface TopicHistoryItem {
  topic: string;
  gradeLevel: string;
  count: number;
}
