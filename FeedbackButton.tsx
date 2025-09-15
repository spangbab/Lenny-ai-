import React from 'react';
import FeedbackIcon from './icons/FeedbackIcon';

const FeedbackButton: React.FC = () => {
  const handleFeedbackClick = () => {
    const subject = encodeURIComponent("Feedback for Lenny AI");
    window.location.href = `mailto:feedback@example.com?subject=${subject}`;
  };

  return (
    <button
      onClick={handleFeedbackClick}
      className="group fixed bottom-6 right-6 p-3 bg-purple-600 text-white rounded-full shadow-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-transform transform hover:scale-110"
      aria-label="Send Feedback"
      title="Send Feedback"
    >
      <FeedbackIcon />
    </button>
  );
};

export default FeedbackButton;