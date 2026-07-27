/**
 * ProgressCircle - Vòng tròn tiến trình SVG dùng chung.
 * Thay thế các SVG circle inline dùng cho tiến độ hoàn thiện.
 */
import React from 'react';

const STROKE_WIDTH = 8;
const SIZE = 128;
const RADIUS = 58;
const CENTER = 64;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const ProgressCircle = ({ percent = 0, label = 'Hoàn thiện', className = '' }) => {
  const offset = CIRCUMFERENCE - (Math.min(100, Math.max(0, percent)) / 100) * CIRCUMFERENCE;

  return (
    <div className={`flex flex-col items-center text-center ${className}`}>
      <div className="relative mb-3 flex items-center justify-center">
        <svg className="h-28 w-28 -rotate-90 transform" viewBox={`0 0 ${SIZE} ${SIZE}`}>
          <circle
            className="text-slate-100 dark:text-[#e5e5e5]"
            cx={CENTER}
            cy={CENTER}
            r={RADIUS}
            fill="transparent"
            stroke="currentColor"
            strokeWidth="6"
          />
          <circle
            className="text-[#004785]"
            cx={CENTER}
            cy={CENTER}
            r={RADIUS}
            fill="transparent"
            stroke="currentColor"
            strokeWidth={STROKE_WIDTH}
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-black text-slate-800 dark:text-[#d4d4d4]">{Math.round(percent)}%</span>
          <span className="mt-0.5 text-[9px] font-black uppercase tracking-wider text-slate-400 dark:text-[#808080]">
            {label}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProgressCircle;
