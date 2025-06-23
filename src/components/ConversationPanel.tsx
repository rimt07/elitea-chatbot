import React, { useState } from 'react';
import { Plus, Settings, Users, Database } from 'lucide-react';
import { Conversation, Participant } from '../types';

interface ConversationPanelProps {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  onCreateConversation: (conversation: Conversation) => void;
  onSelectConversation: (conversation: Conversation) => void;
  onShowParticipants: () => void;
  onShowDatasources: () => void;
}

export const ConversationPanel: React.FC<ConversationPanelProps> = ({
  conversations,
  currentConversation,
  onCreateConversation,
  onSelectConversation,
  onShowParticipants,
  onShowDatasources
}) => {
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [newConversationName, setNewConversationName] = useState('');

  const handleCreateConversation = (e: React.FormEvent) => {
    e.preventDefault();
    if (newConversationName.trim()) {
      const newConversation: Conversation = {
        name: newConversationName.trim(),
        is_private: true,
        source: 'alita',
        participants: [{
          entity_meta: {
            integration_uid: '13c583ff-304c-4480-a5cb-7f0f8bfa8f00',
            model_name: 'anthropic.claude-3-5-sonnet-20240620-v1:0'
          },
          entity_name: 'llm',
          entity_settings: {
            max_tokens: 2048,
            top_p: 0.5,
            top_k: 20,
            temperature: 0.7
          }
        }]
      };
      
      onCreateConversation(newConversation);
      setNewConversationName('');
      setShowNewConversation(false);
    }
  };

  return (
    <div className="p-4 border-r bg-gray-50 h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Conversations</h2>
        <button
          onClick={() => setShowNewConversation(true)}
          className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
        >
          <Plus size={20} />
        </button>
      </div>

      {/* New Conversation Form */}
      {showNewConversation && (
        <form onSubmit={handleCreateConversation} className="mb-4 p-3 bg-white rounded-lg border">
          <input
            type="text"
            value={newConversationName}
            onChange={(e) => setNewConversationName(e.target.value)}
            placeholder="Conversation name..."
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
            autoFocus
          />
          <div className="flex space-x-2">
            <button
              type="submit"
              className="flex-1 px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors"
            >
              Create
            </button>
            <button
              type="button"
              onClick={() => setShowNewConversation(false)}
              className="flex-1 px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Conversations List */}
      <div className="space-y-2 mb-4">
        {conversations.map((conversation, index) => (
          <div
            key={conversation.id || index}
            onClick={() => onSelectConversation(conversation)}
            className={`p-3 rounded-lg cursor-pointer transition-colors ${
              currentConversation?.name === conversation.name
                ? 'bg-blue-100 border-blue-300'
                : 'bg-white hover:bg-gray-100'
            }`}
          >
            <div className="font-medium text-gray-800 text-sm">{conversation.name}</div>
            <div className="text-xs text-gray-500 mt-1">
              {conversation.participants.length} participant(s)
            </div>
          </div>
        ))}
      </div>

      {/* Conversation Tools */}
      {currentConversation && (
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-700 mb-2">Conversation Tools</div>
          
          <button
            onClick={onShowParticipants}
            className="w-full flex items-center space-x-2 p-2 text-left hover:bg-white rounded-lg transition-colors"
          >
            <Users size={16} className="text-gray-500" />
            <span className="text-sm text-gray-700">Manage Participants</span>
          </button>
          
          <button
            onClick={onShowDatasources}
            className="w-full flex items-center space-x-2 p-2 text-left hover:bg-white rounded-lg transition-colors"
          >
            <Database size={16} className="text-gray-500" />
            <span className="text-sm text-gray-700">Attach Datasources</span>
          </button>
          
          <button className="w-full flex items-center space-x-2 p-2 text-left hover:bg-white rounded-lg transition-colors">
            <Settings size={16} className="text-gray-500" />
            <span className="text-sm text-gray-700">Conversation Settings</span>
          </button>
        </div>
      )}
    </div>
  );
};