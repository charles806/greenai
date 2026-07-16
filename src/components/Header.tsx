import React from 'react';
import { Menu, SquarePen } from 'lucide-react';
import { AIMode } from '../types';

interface HeaderProps {
  currentMode: AIMode;
  currentModel: string;
  darkMode: boolean;
  companionMode: boolean;
  selectedLanguage: string;
  onSidebarToggle: () => void;
  onNewChat: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  currentModel,
  onSidebarToggle, 
  onNewChat
}) => {
  return (
    <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-[#171717] border-b border-white/10">
      
      {/* Left: Menu */}
      <button
        onClick={onSidebarToggle}
        className="p-2 rounded-md text-gray-400 hover:text-white hover:bg-white/10 transition"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Center: Model name (ChatGPT style) */}
      <div className="text-sm font-medium text-gray-200">
        {currentModel || 'ChatGPT'}
      </div>

      {/* Right: New chat */}
      <button
        onClick={onNewChat}
        className="p-2 rounded-md text-gray-400 hover:text-white hover:bg-white/10 transition"
      >
        <SquarePen className="w-5 h-5" />
      </button>

    </header>
  );
};