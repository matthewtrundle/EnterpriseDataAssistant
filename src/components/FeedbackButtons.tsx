import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown, MessageSquare } from 'lucide-react';

export const FeedbackButtons: React.FC = () => {
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);
  const [showCorrection, setShowCorrection] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const handleFeedback = (type: 'up' | 'down') => {
    setFeedback(type);
    showFeedbackToast();
  };

  const showFeedbackToast = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleCorrection = () => {
    setShowCorrection(true);
  };

  const submitCorrection = () => {
    setShowCorrection(false);
    showFeedbackToast();
  };

  return (
    <>
      <div className="flex items-center justify-center space-x-4 py-4">
        <span className="text-sm text-gray-600">Was this helpful?</span>
        <button
          onClick={() => handleFeedback('up')}
          className={`p-2 rounded-md transition-colors ${
            feedback === 'up' 
              ? 'bg-green-100 text-green-600' 
              : 'hover:bg-gray-100 text-gray-600'
          }`}
        >
          <ThumbsUp className="w-5 h-5" />
        </button>
        <button
          onClick={() => handleFeedback('down')}
          className={`p-2 rounded-md transition-colors ${
            feedback === 'down' 
              ? 'bg-red-100 text-red-600' 
              : 'hover:bg-gray-100 text-gray-600'
          }`}
        >
          <ThumbsDown className="w-5 h-5" />
        </button>
        <button
          onClick={handleCorrection}
          className="flex items-center space-x-2 px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
        >
          <MessageSquare className="w-4 h-4" />
          <span>Correct this answer</span>
        </button>
      </div>

      {showCorrection && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Help us improve</h3>
            <textarea
              className="w-full p-3 border border-gray-300 rounded-md resize-none"
              rows={4}
              placeholder="What should the correct answer be?"
            />
            <div className="mt-4 flex justify-end space-x-3">
              <button
                onClick={() => setShowCorrection(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={submitCorrection}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {showToast && (
        <div className="fixed bottom-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in">
          <p className="font-medium">Thanks! I'm learning from your feedback.</p>
        </div>
      )}
    </>
  );
};