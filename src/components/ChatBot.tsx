import React, { useState, useEffect } from 'react';
import { X, Minimize2, Maximize2, AlertCircle } from 'lucide-react';
import { Conversation, Message, Participant } from '../types';
import { eliteaApi } from '../services/eliteaApi';
import { ConversationPanel } from './ConversationPanel';
import { ParticipantPanel } from './ParticipantPanel';
import { MessagePanel } from './MessagePanel';

interface ChatBotProps {
  isOpen: boolean;
  onClose: () => void;
}

type ActivePanel = 'chat' | 'conversations' | 'participants' | 'datasources';

export const ChatBot: React.FC<ChatBotProps> = ({ isOpen, onClose }) => {
  const [activePanel, setActivePanel] = useState<ActivePanel>('conversations');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Check for API configuration on mount
  useEffect(() => {
    try {
      // This will throw an error if environment variables are missing
      import('../config/api').then(() => {
        setApiError(null);
      }).catch((error) => {
        setApiError(error.message);
      });
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'API configuration error');
    }
  }, []);

  const handleCreateConversation = async (conversation: Conversation) => {
    if (apiError) return;
    
    setIsLoading(true);
    try {
      const response = await eliteaApi.createConversation(conversation);
      if (response.success) {
        const newConversation = { ...conversation, id: response.data?.id };
        setConversations(prev => [...prev, newConversation]);
        setCurrentConversation(newConversation);
        setActivePanel('chat');
        setMessages([]);
      }
    } catch (error) {
      console.error('Failed to create conversation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectConversation = (conversation: Conversation) => {
    setCurrentConversation(conversation);
    setActivePanel('chat');
    setMessages([]);
  };

  const handleSendMessage = async (messageContent: string) => {
    if (!currentConversation || apiError) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: messageContent,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      type: 'assistant',
      content: '',
      timestamp: new Date(),
      streaming: true
    };

    setMessages(prev => [...prev, assistantMessage]);

    try {
      const participant = currentConversation.participants[0];
      const request = {
        type: 'chat',
        model_settings: {
          temperature: participant.entity_settings.temperature,
          top_k: participant.entity_settings.top_k,
          top_p: participant.entity_settings.top_p,
          max_tokens: participant.entity_settings.max_tokens,
          stream: false, // Set to false to handle JSON response properly
          model: {
            model_name: participant.entity_meta.model_name,
            integration_uid: participant.entity_meta.integration_uid,
            integration_name: 'my_integration'
          }
        },
        variables: [],
        user_input: messageContent,
        format_response: true
      };

      let accumulatedContent = '';
      let messageCount = 0;
      
      await eliteaApi.streamMessage(request, (chunk) => {
        messageCount++;
        
        if (messageCount === 1) {
          // First chunk - replace the content
          accumulatedContent = chunk;
        } else {
          // Subsequent chunks - append with space
          accumulatedContent += ' ' + chunk;
        }
        
        setMessages(prev => prev.map(msg => 
          msg.id === assistantMessage.id 
            ? { ...msg, content: accumulatedContent, streaming: true }
            : msg
        ));
      });

      // Mark as complete
      setMessages(prev => prev.map(msg => 
        msg.id === assistantMessage.id 
          ? { ...msg, streaming: false, timestamp: new Date() }
          : msg
      ));
    } catch (error) {
      console.error('Failed to send message:', error);
      setMessages(prev => prev.map(msg => 
        msg.id === assistantMessage.id 
          ? { ...msg, content: 'Sorry, I encountered an error. Please try again.', streaming: false }
          : msg
      ));
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddParticipant = async (participant: Participant) => {
    if (!currentConversation?.id || apiError) return;

    try {
      const response = await eliteaApi.addParticipants(currentConversation.id, [participant]);
      if (response.success) {
        const updatedConversation = {
          ...currentConversation,
          participants: [...currentConversation.participants, participant]
        };
        setCurrentConversation(updatedConversation);
        setConversations(prev => prev.map(conv => 
          conv.id === currentConversation.id ? updatedConversation : conv
        ));
      }
    } catch (error) {
      console.error('Failed to add participant:', error);
    }
  };

  const handleRemoveParticipant = (index: number) => {
    if (!currentConversation) return;

    const updatedParticipants = currentConversation.participants.filter((_, i) => i !== index);
    const updatedConversation = {
      ...currentConversation,
      participants: updatedParticipants
    };
    
    setCurrentConversation(updatedConversation);
    setConversations(prev => prev.map(conv => 
      conv.id === currentConversation.id ? updatedConversation : conv
    ));
  };

  const handleUpdateParticipant = (index: number, participant: Participant) => {
    if (!currentConversation) return;

    const updatedParticipants = [...currentConversation.participants];
    updatedParticipants[index] = participant;
    
    const updatedConversation = {
      ...currentConversation,
      participants: updatedParticipants
    };
    
    setCurrentConversation(updatedConversation);
    setConversations(prev => prev.map(conv => 
      conv.id === currentConversation.id ? updatedConversation : conv
    ));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-end p-4">
      <div className="bg-black bg-opacity-50 absolute inset-0" onClick={onClose} />
      
      <div className={`
        relative bg-white rounded-lg shadow-2xl border
        transition-all duration-300 ease-in-out
        ${isMinimized ? 'w-80 h-16' : 'w-96 h-[600px]'}
        max-w-full max-h-full
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-lg">
          <h1 className="font-semibold">Elitea Assistant</h1>
          <div className="flex items-center space-x-2">
            {apiError && (
              <AlertCircle size={16} className="text-yellow-300" title="API Configuration Error" />
            )}
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
            >
              {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
            </button>
            <button
              onClick={onClose}
              className="p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* API Error Message */}
        {apiError && !isMinimized && (
          <div className="p-4 bg-red-50 border-b border-red-200">
            <div className="flex items-center space-x-2 text-red-700">
              <AlertCircle size={16} />
              <div>
                <p className="text-sm font-medium">API Configuration Error</p>
                <p className="text-xs">{apiError}</p>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        {!isMinimized && !apiError && (
          <div className="h-[calc(100%-64px)] flex">
            {activePanel === 'conversations' && (
              <ConversationPanel
                conversations={conversations}
                currentConversation={currentConversation}
                onCreateConversation={handleCreateConversation}
                onSelectConversation={handleSelectConversation}
                onShowParticipants={() => setActivePanel('participants')}
                onShowDatasources={() => setActivePanel('datasources')}
              />
            )}

            {activePanel === 'participants' && currentConversation && (
              <ParticipantPanel
                participants={currentConversation.participants}
                onAddParticipant={handleAddParticipant}
                onRemoveParticipant={handleRemoveParticipant}
                onUpdateParticipant={handleUpdateParticipant}
                onBack={() => setActivePanel('conversations')}
              />
            )}

            {activePanel === 'chat' && currentConversation && (
              <div className="flex-1 flex flex-col">
                <div className="p-3 border-b bg-gray-50 flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-800">{currentConversation.name}</h3>
                    <p className="text-sm text-gray-600">
                      {currentConversation.participants.length} participant(s)
                    </p>
                  </div>
                  <button
                    onClick={() => setActivePanel('conversations')}
                    className="text-sm text-blue-500 hover:text-blue-700"
                  >
                    Back to Conversations
                  </button>
                </div>
                <MessagePanel
                  messages={messages}
                  onSendMessage={handleSendMessage}
                  isLoading={isLoading}
                />
              </div>
            )}

            {activePanel === 'datasources' && (
              <div className="flex-1 p-4">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Datasources</h2>
                <div className="text-center text-gray-500 mt-8">
                  <p>Datasource management coming soon...</p>
                  <button
                    onClick={() => setActivePanel('conversations')}
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Back to Conversations
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};