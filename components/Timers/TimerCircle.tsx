import React from 'react';

interface TimerCircleProps {
  totalTime: number;
  currentTime: number;
  colorClass: string; // e.g., "text-red-500"
  children?: React.ReactNode;
}

export const TimerCircle: React.FC<TimerCircleProps> = ({ 
  totalTime, 
  currentTime, 
  colorClass,
  children 
}) => {
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.max(0, Math.min(1, currentTime / totalTime));
  const strokeDashoffset = circumference - (progress * circumference);

  return (
    <div className="relative flex items-center justify-center">
      {/* Background Circle */}
      <svg 
        className="transform -rotate-90 w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 transition-all duration-300"
        viewBox="0 0 260 260" 
      >
        <circle
          cx="130"
          cy="130"
          r={radius}
          stroke="currentColor"
          strokeWidth="12"
          fill="transparent"
          className="text-base-300"
        />
        {/* Progress Circle */}
        <circle
          cx="130"
          cy="130"
          r={radius}
          stroke="currentColor"
          strokeWidth="12"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={`transition-all duration-1000 ease-linear ${colorClass}`}
        />
      </svg>
      {/* Inner Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {children}
      </div>
    </div>
  );
};