import React from 'react';
import { AnalysisResult } from '../types';
import { X, Heart, Sparkles, Star, MessageCircleHeart } from 'lucide-react';

interface AnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLoading: boolean;
  result: AnalysisResult | null;
}

export const AnalysisModal: React.FC<AnalysisModalProps> = ({ isOpen, onClose, isLoading, result }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-bounce-in">

        {/* Loading shimmer bar */}
        {isLoading && (
          <div className="absolute top-0 left-0 w-full h-1.5 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-pink-400 via-purple-400 to-pink-400 animate-[shimmer_1.5s_ease-in-out_infinite]"
                 style={{ width: '200%', backgroundSize: '50% 100%' }} />
          </div>
        )}

        {/* Header */}
        <div className="bg-gradient-to-r from-pink-100 to-purple-100 px-6 py-4 flex justify-between items-center">
          <h2 className="text-lg font-bold text-pink-600 flex items-center gap-2">
            <Heart className="w-5 h-5 animate-heartbeat" fill="#ec4899" />
            Cuteness Analysis
          </h2>
          <button onClick={onClose} className="text-pink-300 hover:text-pink-500 transition-colors p-1 rounded-full hover:bg-pink-50">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6 min-h-[280px] flex flex-col justify-center">
          {isLoading ? (
            <div className="text-center space-y-4">
              <div className="flex justify-center gap-2">
                {['💖', '✨', '🌸', '💫', '🦋'].map((emoji, i) => (
                  <span
                    key={i}
                    className="text-2xl animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  >
                    {emoji}
                  </span>
                ))}
              </div>
              <p className="text-pink-400 font-medium animate-pulse">Analyzing your cuteness...</p>
              <p className="text-xs text-pink-300">This won't take long, cutie!</p>
            </div>
          ) : result ? (
            <div className="space-y-5 animate-slide-up">

              {/* Cuteness Level */}
              <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl p-4 text-center border border-pink-100">
                <div className="text-xs text-pink-400 font-medium mb-1 flex items-center justify-center gap-1">
                  <Star className="w-3 h-3" fill="#f9a8d4" />
                  Cuteness Level
                  <Star className="w-3 h-3" fill="#f9a8d4" />
                </div>
                <div className="text-xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                  {result.cutenessLevel}
                </div>
              </div>

              {/* Compliment */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-pink-400">
                  <Sparkles className="w-3.5 h-3.5" />
                  What We See
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {result.compliment}
                </p>
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-pink-400">
                  <Star className="w-3.5 h-3.5" />
                  Your Vibes
                </div>
                <div className="flex flex-wrap gap-2">
                  {result.tags.map((tag, i) => (
                    <span key={i} className="text-xs bg-gradient-to-r from-pink-100 to-purple-100 text-pink-600 px-3 py-1.5 rounded-full font-medium border border-pink-200">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Love Note */}
              <div className="bg-gradient-to-br from-pink-50 via-white to-purple-50 rounded-2xl p-4 border border-pink-100 text-center">
                <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-purple-400 mb-2">
                  <MessageCircleHeart className="w-3.5 h-3.5" />
                  A Little Love Note
                </div>
                <p className="text-gray-600 text-sm italic">
                  "{result.loveNote}"
                </p>
              </div>

              <div className="pt-2 flex justify-center">
                <button
                  onClick={onClose}
                  className="bg-gradient-to-r from-pink-400 to-purple-400 hover:from-pink-500 hover:to-purple-500 text-white px-8 py-2.5 rounded-full font-semibold text-sm shadow-lg hover:shadow-xl transition-all active:scale-95 hover:scale-105"
                >
                  Aww, Thanks! 💖
                </button>
              </div>

            </div>
          ) : (
            <div className="text-center text-pink-400">
              <p className="text-lg">Something went wrong 💔</p>
              <p className="text-sm text-pink-300 mt-2">But you're still cute though!</p>
            </div>
          )}
        </div>

      </div>

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0%); }
        }
      `}</style>
    </div>
  );
};
