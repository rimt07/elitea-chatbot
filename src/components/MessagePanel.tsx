import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { Message, Participant } from '../types';

interface MessagePanelProps {
  messages: Message[];
  onSendMessage: (message: string, targetParticipant?: Participant) => void;
  isLoading: boolean;
  participants?: Participant[];
}

export const MessagePanel: React.FC<MessagePanelProps> = ({ 
  messages, 
  onSendMessage, 
  isLoading,
  participants = []
}) => {
  const [inputMessage, setInputMessage] = useState('');
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputMessage(value);

    // Check for @ mentions
    const atIndex = value.lastIndexOf('@');
    if (atIndex !== -1 && atIndex === value.length - 1) {
      setShowMentions(true);
      setMentionQuery('');
    } else if (atIndex !== -1 && value.charAt(atIndex - 1) === ' ' || atIndex === 0) {
      const query = value.substring(atIndex + 1);
      if (query.includes(' ')) {
        setShowMentions(false);
      } else {
        setShowMentions(true);
        setMentionQuery(query);
      }
    } else {
      setShowMentions(false);
    }
  };

  const handleMentionSelect = (participant: Participant) => {
    const atIndex = inputMessage.lastIndexOf('@');
    const participantName = participant.meta?.user_name || participant.entity_name || 'Participant';
    const beforeMention = inputMessage.substring(0, atIndex);
    const newMessage = `${beforeMention}@${participantName} `;
    
    setInputMessage(newMessage);
    setSelectedParticipant(participant);
    setShowMentions(false);
    inputRef.current?.focus();
  };

  const filteredParticipants = participants.filter(participant => {
    const name = participant.meta?.user_name || participant.entity_name || 'Participant';
    return name.toLowerCase().includes(mentionQuery.toLowerCase());
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMessage.trim() && !isLoading) {
      onSendMessage(inputMessage.trim(), selectedParticipant || undefined);
      setInputMessage('');
      setSelectedParticipant(null);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <Bot size={48} className="mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium">Welcome to Elitea Chat</p>
            <p className="text-sm">Start a conversation by typing a message below.</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`
                  max-w-[80%] p-3 rounded-lg
                  ${message.type === 'user' 
                    ? 'bg-blue-500 text-white ml-4' 
                    : 'bg-gray-100 text-gray-800 mr-4'
                  }
                `}
              >
                <div className="flex items-start space-x-2">
                  {message.type === 'assistant' && (
                    <Bot size={16} className="mt-1 text-blue-500 flex-shrink-0" />
                  )}
                  {message.type === 'user' && (
                    <User size={16} className="mt-1 text-blue-100 flex-shrink-0" />
                  )}
                  <div>
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    {message.streaming && (
                      <div className="flex items-center mt-1">
                        <Loader2 size={12} className="animate-spin mr-1" />
                        <span className="text-xs opacity-75">Thinking...</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-xs opacity-75 mt-1">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t bg-gray-50 relative">
        {/* Mention dropdown */}
        {showMentions && filteredParticipants.length > 0 && (
          <div className="absolute bottom-full left-4 right-4 mb-2 bg-white border rounded-lg shadow-lg max-h-40 overflow-y-auto z-10">
            {filteredParticipants.map((participant, index) => (
              <button
                key={index}
                onClick={() => handleMentionSelect(participant)}
                className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center space-x-2"
              >
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">
                  {(participant.meta?.user_name || participant.entity_name || 'P')[0].toUpperCase()}
                </div>
                <span className="text-sm">
                  {participant.meta?.user_name || participant.entity_name || 'Participant'}
                </span>
              </button>
            ))}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={handleInputChange}
              placeholder="Type your message... (use @ to mention participants)"
              disabled={isLoading}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            />
            {selectedParticipant && (
              <div className="absolute -top-8 left-0 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                Targeting: {selectedParticipant.meta?.user_name || selectedParticipant.entity_name}
              </div>
            )}
          </div>
          <button
            type="submit"
            disabled={!inputMessage.trim() || isLoading}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <Send size={20} />
            )}
          </button>
        </form>
      </div>
    </div>
  );
};