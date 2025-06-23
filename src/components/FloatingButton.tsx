import React from 'react';
import { MessageCircle, X } from 'lucide-react';

interface FloatingButtonProps {
  isOpen: boolean;
  onClick: () => void;
  unreadCount?: number;
}

export const FloatingButton: React.FC<FloatingButtonProps> = ({ 
  isOpen, 
  onClick, 
  unreadCount = 0 
}) => {
  return (
    <button
      onClick={onClick}
      className={`
        fixed bottom-6 right-6 z-50 
        w-14 h-14 rounded-full
        bg-gradient-to-r from-blue-500 to-purple-600
        shadow-lg hover:shadow-xl
        flex items-center justify-center
        transition-all duration-300 ease-in-out
        hover:scale-110 active:scale-95
        ${isOpen ? 'rotate-90' : 'rotate-0'}
      `}
    >
      {unreadCount > 0 && !isOpen && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
          <span className="text-white text-xs font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        </div>
      )}
      
      <div className="relative">
        <MessageCircle 
          size={24} 
          className={`text-white transition-all duration-300 ${
            isOpen ? 'opacity-0 rotate-90' : 'opacity-100 rotate-0'
          }`}
        />
        <X 
          size={24} 
          className={`text-white absolute top-0 left-0 transition-all duration-300 ${
            isOpen ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-90'
          }`}
        />
      </div>
    </button>
  );
};