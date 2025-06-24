import React, { useState, useEffect } from 'react';
import { X, Minimize2, Maximize2, AlertCircle, Paperclip, Wrench } from 'lucide-react';
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
  const [showAttachmentDialog, setShowAttachmentDialog] = useState(false);
  const [showToolsDialog, setShowToolsDialog] = useState(false);

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
                <div className="p-3 border-b bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
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
                  
                  {/* Attachment and Tools buttons */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setShowAttachmentDialog(true)}
                      className="flex items-center space-x-1 px-3 py-1 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                    >
                      <Paperclip size={14} />
                      <span>Add Attachment</span>
                    </button>
                    <button
                      onClick={() => setShowToolsDialog(true)}
                      className="flex items-center space-x-1 px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
                    >
                      <Wrench size={14} />
                      <span>Add Tools</span>
                    </button>
                  </div>
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

        {/* Attachment Dialog */}
        {showAttachmentDialog && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-10">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Add Attachment</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload File
                  </label>
                  <input
                    type="file"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    accept=".pdf,.doc,.docx,.txt,.csv,.xlsx"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Add URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://example.com/document.pdf"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowAttachmentDialog(false)}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // TODO: Implement attachment upload
                    setShowAttachmentDialog(false);
                  }}
                  className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  Add Attachment
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tools Dialog */}
        {showToolsDialog && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-10">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Add Tools</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                  <input type="checkbox" id="web-search" className="rounded" />
                  <label htmlFor="web-search" className="flex-1">
                    <div className="font-medium">Web Search</div>
                    <div className="text-sm text-gray-600">Search the web for current information</div>
                  </label>
                </div>
                <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                  <input type="checkbox" id="calculator" className="rounded" />
                  <label htmlFor="calculator" className="flex-1">
                    <div className="font-medium">Calculator</div>
                    <div className="text-sm text-gray-600">Perform mathematical calculations</div>
                  </label>
                </div>
                <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                  <input type="checkbox" id="code-interpreter" className="rounded" />
                  <label htmlFor="code-interpreter" className="flex-1">
                    <div className="font-medium">Code Interpreter</div>
                    <div className="text-sm text-gray-600">Execute and analyze code</div>
                  </label>
                </div>
                <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                  <input type="checkbox" id="image-generator" className="rounded" />
                  <label htmlFor="image-generator" className="flex-1">
                    <div className="font-medium">Image Generator</div>
                    <div className="text-sm text-gray-600">Generate images from text descriptions</div>
                  </label>
                </div>
              </div>
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowToolsDialog(false)}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // TODO: Implement tools activation
                    setShowToolsDialog(false);
                  }}
                  className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                >
                  Add Tools
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};