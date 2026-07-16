import React from 'react';
import { Bot } from 'lucide-react';

interface TypingIndicatorProps {
  darkMode: boolean;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({ darkMode }) => {
  return (
    <div className="w-full">
      <div className="max-w-3xl mx-auto px-4 py-3 flex gap-3">
        
        {/* Green gradient circle loader with robot */}
        <div className="flex-shrink-0 mt-0.5">
          <div className="w-[30px] h-[30px] rounded-full bg-gradient-to-br from-emerald-400 via-green-500 to-emerald-600 flex items-center justify-center animate-spin">
            <Bot className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
        </div>

        {/* Shimmer lines */}
        <div className="flex-1 pt-1 space-y-3">
          {/* Line 1 — full width */}
          <div
            className="h-4 rounded-full overflow-hidden"
            style={{ width: '92%' }}
          >
            <div className={`h-full rounded-full ${shimmerClass(darkMode)}`} />
          </div>

          {/* Line 2 — slightly shorter */}
          <div
            className="h-4 rounded-full overflow-hidden"
            style={{ width: '78%' }}
          >
            <div className={`h-full rounded-full ${shimmerClass(darkMode)}`} style={{ animationDelay: '0.15s' }} />
          </div>

          {/* Line 3 — shortest */}
          <div
            className="h-4 rounded-full overflow-hidden"
            style={{ width: '55%' }}
          >
            <div className={`h-full rounded-full ${shimmerClass(darkMode)}`} style={{ animationDelay: '0.3s' }} />
          </div>
        </div>
      </div>

      {/* Keyframe styles */}
      <style>{`
        @keyframes greenShimmer {
          0% { background-position: -600px 0; }
          100% { background-position: 600px 0; }
        }
        .green-shimmer-dark {
          background: linear-gradient(
            90deg,
            #2a2a2a 25%,
            #10b981 37%,
            #059669 50%,
            #047857 63%,
            #2a2a2a 75%
          );
          background-size: 600px 100%;
          animation: greenShimmer 1.8s infinite linear;
          opacity: 0.75;
        }
        .green-shimmer-light {
          background: linear-gradient(
            90deg,
            #e8e8e8 25%,
            #10b981 37%,
            #059669 50%,
            #047857 63%,
            #e8e8e8 75%
          );
          background-size: 600px 100%;
          animation: greenShimmer 1.8s infinite linear;
          opacity: 0.7;
        }
      `}</style>
    </div>
  );
};

function shimmerClass(darkMode: boolean) {
  return darkMode ? 'green-shimmer-dark' : 'green-shimmer-light';
}