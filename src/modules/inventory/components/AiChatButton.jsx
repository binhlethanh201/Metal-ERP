import React from 'react';
import MaterialIcon from './MaterialIcon';

const AiChatButton = () => {
  return (
    <button className="fixed bottom-8 right-8 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#004785] text-white shadow-2xl transition-transform hover:scale-110">
      <MaterialIcon name="chat" className="text-2xl" />
      <span className="absolute -right-1 -top-1 flex h-4 w-4">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
        <span className="relative inline-flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold">
          1
        </span>
      </span>
    </button>
  );
};

export default AiChatButton;
