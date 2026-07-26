import React from 'react';
import { Factory, Sparkles } from 'lucide-react';

const Logo = ({ moduleName, className = '' }) => {
  return (
    <div className={`flex select-none items-center gap-3.5 ${className}`}>
      <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] bg-gradient-to-br from-primary to-[#002b54] text-white shadow-lg shadow-primary/30 transition-transform duration-300 hover:scale-105">
        <Factory size={26} strokeWidth={2} />
        <Sparkles
          size={14}
          className="absolute -right-1.5 -top-1.5 animate-pulse text-[#FBC02D]"
          strokeWidth={2.5}
        />
      </div>

      <div className="flex flex-col justify-center pt-0.5">
        <div className="flex items-baseline gap-1.5 text-xl font-black leading-none tracking-tighter text-textMain dark:text-[#e5e5e5]">
          <span>M.E.P</span>
          <span className="text-base font-bold leading-none tracking-tight text-primary dark:text-blue-400">
            SYSTEM
          </span>
        </div>

        {moduleName && (
          <div className="mt-1.5 flex w-fit items-center rounded-full bg-primary/10 px-2.5 py-1 dark:bg-blue-900/40">
            <span className="text-[9px] font-black uppercase leading-none tracking-[0.2em] text-primary dark:text-blue-300">
              {moduleName}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Logo;
