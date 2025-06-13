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
      <div className="flex items-center justify-center space-x-6 py-6">
        <span className="text-sm font-medium text-neutral-600">Was this helpful?</span>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleFeedback('up')}
            className={`p-3 rounded-xl transition-all duration-200 ${
              feedback === 'up' 
                ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg scale-110' 
                : 'hover:bg-neutral-100 text-neutral-600 hover:text-emerald-600'
            }`}
          >
            <ThumbsUp className="w-5 h-5" />
          </button>
          <button
            onClick={() => handleFeedback('down')}
            className={`p-3 rounded-xl transition-all duration-200 ${
              feedback === 'down' 
                ? 'bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg scale-110' 
                : 'hover:bg-neutral-100 text-neutral-600 hover:text-red-600'
            }`}
          >
            <ThumbsDown className="w-5 h-5" />
          </button>
        </div>
        <div className="h-6 w-px bg-neutral-200"></div>
        <button
          onClick={handleCorrection}
          className="flex items-center space-x-2 px-5 py-2.5 text-sm font-medium text-brand-600 
                   hover:bg-brand-50 border border-brand-200 rounded-xl transition-all 
                   hover:shadow-md hover:-translate-y-0.5"
        >
          <MessageSquare className="w-4 h-4" />
          <span>Improve this answer</span>
        </button>
      </div>

      {showCorrection && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-scale-in">
            <h3 className="text-xl font-bold text-neutral-900 mb-6">Help us improve</h3>
            <textarea
              className="w-full p-4 border border-neutral-200 rounded-xl resize-none 
                       focus:ring-4 focus:ring-brand-500/20 focus:border-brand-500 
                       transition-all text-neutral-700 placeholder-neutral-400"
              rows={4}
              placeholder="What should the correct answer be?"
            />
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowCorrection(false)}
                className="px-6 py-2.5 text-neutral-600 hover:bg-neutral-100 rounded-xl 
                         font-medium transition-all hover:shadow-sm"
              >
                Cancel
              </button>
              <button
                onClick={submitCorrection}
                className="btn-primary"
              >
                Submit Feedback
              </button>
            </div>
          </div>
        </div>
      )}

      {showToast && (
        <div className="fixed bottom-6 right-6 glass-card px-8 py-4 rounded-2xl shadow-2xl z-50 animate-slide-up">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="font-semibold text-neutral-900">Thanks! I'm learning from your feedback.</p>
          </div>
        </div>
      )}
    </>
  );
};