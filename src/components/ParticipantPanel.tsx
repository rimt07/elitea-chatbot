import React, { useState, useEffect } from 'react';
import { Plus, Settings, Trash2, ArrowLeft, Users, Search, Loader2 } from 'lucide-react';
import { Participant, AvailableParticipant, AvailableParticipantsResponse } from '../types';
import { eliteaApi } from '../services/eliteaApi';

interface ParticipantPanelProps {
  participants: Participant[];
  onAddParticipant: (participant: Participant) => void;
  onUpdateParticipants: (participant: Participant) => void; // For updating local state only
  onRemoveParticipant: (index: number) => void;
  onUpdateParticipant: (index: number, participant: Participant) => void;
  onBack: () => void;
  conversationId?: number; // Add conversation ID for API calls
}

export const ParticipantPanel: React.FC<ParticipantPanelProps> = ({
  participants,
  onAddParticipant,
  onUpdateParticipants,
  onRemoveParticipant,
  onUpdateParticipant,
  onBack,
  conversationId
}) => {
  const [activeTab, setActiveTab] = useState<'current' | 'available'>('current');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [availableParticipants, setAvailableParticipants] = useState<AvailableParticipant[]>([]);
  const [isLoadingAvailable, setIsLoadingAvailable] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [addingParticipantId, setAddingParticipantId] = useState<number | null>(null);
  const [newParticipant, setNewParticipant] = useState<Participant>({
    entity_name: 'llm',
    entity_meta: {
      integration_uid: '13c583ff-304c-4480-a5cb-7f0f8bfa8f00',
      model_name: 'anthropic.claude-3-5-sonnet-20240620-v1:0'
    },
    entity_settings: {
      max_tokens: 2048,
      top_p: 0.5,
      top_k: 20,
      temperature: 0.7
    }
  });

  // Fetch available participants when tab changes to 'available'
  useEffect(() => {
    if (activeTab === 'available' && availableParticipants.length === 0) {
      fetchAvailableParticipants();
    }
  }, [activeTab, availableParticipants.length]);

  const fetchAvailableParticipants = async () => {
    setIsLoadingAvailable(true);
    try {
      const response = await eliteaApi.getAvailableParticipants();
      if (response.success && response.data) {
        const data = response.data as AvailableParticipantsResponse;
        setAvailableParticipants(data.rows);
      }
    } catch (error) {
      console.error('Failed to fetch available participants:', error);
    } finally {
      setIsLoadingAvailable(false);
    }
  };

  const filteredAvailableParticipants = availableParticipants.filter(participant =>
    participant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    participant.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addAvailableParticipant = async (availableParticipant: AvailableParticipant) => {
    if (!conversationId) {
      console.error('No conversation ID available');
      return;
    }

    setAddingParticipantId(availableParticipant.id);

    try {
      // Call the new API method with the participant ID
      const response = await eliteaApi.addAvailableParticipant(conversationId, availableParticipant.id);
      if (response.success && response.data) {
        // The API returns an array with the added participant
        const addedParticipants = response.data as Participant[];
        if (addedParticipants.length > 0) {
          const addedParticipant = addedParticipants[0];
          // Call the parent handler to update the local state only (no API call)
          onUpdateParticipants(addedParticipant);
          console.log(`Successfully added participant: ${availableParticipant.name}`);
          
          // Switch to Current tab to show the newly added participant
          setActiveTab('current');
        }
      } else {
        console.error('Failed to add participant:', response.error);
        alert(`Failed to add participant: ${response.error}`);
      }
    } catch (error) {
      console.error('Error adding participant:', error);
      alert('Error adding participant. Please try again.');
    } finally {
      setAddingParticipantId(null);
    }
  };

  const handleAddParticipant = (e: React.FormEvent) => {
    e.preventDefault();
    onAddParticipant(newParticipant);
    setShowAddForm(false);
    setNewParticipant({
      entity_name: 'llm',
      entity_meta: {
        integration_uid: '13c583ff-304c-4480-a5cb-7f0f8bfa8f00',
        model_name: 'anthropic.claude-3-5-sonnet-20240620-v1:0'
      },
      entity_settings: {
        max_tokens: 2048,
        top_p: 0.5,
        top_k: 20,
        temperature: 0.7
      }
    });
  };

  const handleUpdateParticipant = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingIndex !== null) {
      onUpdateParticipant(editingIndex, newParticipant);
      setEditingIndex(null);
    }
  };

  const startEditing = (index: number) => {
    setNewParticipant(participants[index]);
    setEditingIndex(index);
    setShowAddForm(true);
  };

  return (
    <div className="p-4 h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <button
            onClick={onBack}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-lg font-semibold text-gray-800">Participants</h2>
        </div>
        {activeTab === 'current' && (
          <button
            onClick={() => setShowAddForm(true)}
            className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Plus size={20} />
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-4 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('current')}
          className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-md transition-colors ${
            activeTab === 'current'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <Users size={16} />
          <span>Current ({participants.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('available')}
          className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-md transition-colors ${
            activeTab === 'available'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <Search size={16} />
          <span>Available ({availableParticipants.length})</span>
        </button>
      </div>

      {/* Add/Edit Participant Form */}
      {showAddForm && (
        <form onSubmit={editingIndex !== null ? handleUpdateParticipant : handleAddParticipant} className="mb-4 p-4 bg-white rounded-lg border">
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Entity Name</label>
              <input
                type="text"
                value={newParticipant.entity_name}
                onChange={(e) => setNewParticipant({
                  ...newParticipant,
                  entity_name: e.target.value
                })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Model Name</label>
              <input
                type="text"
                value={newParticipant.entity_meta.model_name}
                onChange={(e) => setNewParticipant({
                  ...newParticipant,
                  entity_meta: {
                    ...newParticipant.entity_meta,
                    model_name: e.target.value
                  }
                })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Tokens</label>
                <input
                  type="number"
                  value={newParticipant.entity_settings.max_tokens}
                  onChange={(e) => setNewParticipant({
                    ...newParticipant,
                    entity_settings: {
                      ...newParticipant.entity_settings,
                      max_tokens: parseInt(e.target.value)
                    }
                  })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Temperature</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="2"
                  value={newParticipant.entity_settings.temperature}
                  onChange={(e) => setNewParticipant({
                    ...newParticipant,
                    entity_settings: {
                      ...newParticipant.entity_settings,
                      temperature: parseFloat(e.target.value)
                    }
                  })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Top P</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="1"
                  value={newParticipant.entity_settings.top_p}
                  onChange={(e) => setNewParticipant({
                    ...newParticipant,
                    entity_settings: {
                      ...newParticipant.entity_settings,
                      top_p: parseFloat(e.target.value)
                    }
                  })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Top K</label>
                <input
                  type="number"
                  value={newParticipant.entity_settings.top_k}
                  onChange={(e) => setNewParticipant({
                    ...newParticipant,
                    entity_settings: {
                      ...newParticipant.entity_settings,
                      top_k: parseInt(e.target.value)
                    }
                  })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
          
          <div className="flex space-x-2 mt-4">
            <button
              type="submit"
              className="flex-1 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              {editingIndex !== null ? 'Update' : 'Add'} Participant
            </button>
            <button
              type="button"
              onClick={() => {
                setShowAddForm(false);
                setEditingIndex(null);
              }}
              className="flex-1 px-3 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Current Participants Tab */}
      {activeTab === 'current' && (
        <div className="space-y-3">
          {participants.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <Users size={48} className="mx-auto mb-4 text-gray-400" />
              <p>No participants added yet</p>
              <button
                onClick={() => setShowAddForm(true)}
                className="mt-2 text-blue-500 hover:text-blue-700"
              >
                Add your first participant
              </button>
            </div>
          ) : (
            participants.map((participant, index) => (
              <div key={index} className="p-3 bg-white rounded-lg border">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="font-medium text-gray-800">{participant.entity_name}</div>
                    {participant.meta?.user_name && (
                      <div className="text-sm text-gray-600">{participant.meta.user_name}</div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    {participant.meta?.user_avatar && (
                      <img 
                        src={participant.meta.user_avatar} 
                        alt={participant.meta.user_name} 
                        className="w-8 h-8 rounded-full"
                      />
                    )}
                    <div className="flex space-x-1">
                      <button
                        onClick={() => startEditing(index)}
                        className="p-1 text-blue-500 hover:bg-blue-50 rounded transition-colors"
                      >
                        <Settings size={16} />
                      </button>
                      <button
                        onClick={() => onRemoveParticipant(index)}
                        className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="text-sm text-gray-600 space-y-1">
                  {participant.entity_meta.model_name && (
                    <div>Model: {participant.entity_meta.model_name}</div>
                  )}
                  {participant.entity_meta.id && (
                    <div>Participant ID: {participant.entity_meta.id}</div>
                  )}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {participant.entity_settings.max_tokens && (
                      <div>Max Tokens: {participant.entity_settings.max_tokens}</div>
                    )}
                    {participant.entity_settings.temperature && (
                      <div>Temperature: {participant.entity_settings.temperature}</div>
                    )}
                    {participant.entity_settings.top_p && (
                      <div>Top P: {participant.entity_settings.top_p}</div>
                    )}
                    {participant.entity_settings.top_k && (
                      <div>Top K: {participant.entity_settings.top_k}</div>
                    )}
                    {participant.entity_settings.test && (
                      <div>Test: {participant.entity_settings.test}</div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Available Participants Tab */}
      {activeTab === 'available' && (
        <div className="space-y-3">
          {/* Search Bar */}
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search available participants..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Loading State */}
          {isLoadingAvailable && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="text-gray-500 mt-2">Loading available participants...</p>
            </div>
          )}

          {/* Available Participants List */}
          {!isLoadingAvailable && (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredAvailableParticipants.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <Search size={48} className="mx-auto mb-4 text-gray-400" />
                  <p>No participants found</p>
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="mt-2 text-blue-500 hover:text-blue-700"
                    >
                      Clear search
                    </button>
                  )}
                </div>
              ) : (
                filteredAvailableParticipants.map((participant) => (
                  <div key={participant.id} className="p-3 bg-white rounded-lg border hover:border-blue-300 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="font-medium text-gray-800">{participant.name}</div>
                        <div className="text-xs text-gray-500">ID: {participant.id}</div>
                      </div>
                      <button
                        onClick={() => addAvailableParticipant(participant)}
                        disabled={addingParticipantId === participant.id}
                        className={`p-1 rounded transition-colors ${
                          addingParticipantId === participant.id
                            ? 'text-gray-400 cursor-not-allowed'
                            : 'text-green-600 hover:bg-green-50'
                        }`}
                        title={addingParticipantId === participant.id ? 'Adding...' : 'Add to conversation'}
                      >
                        {addingParticipantId === participant.id ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <Plus size={16} />
                        )}
                      </button>
                    </div>
                    
                    <div className="text-sm text-gray-600 mb-2">
                      {participant.description || 'No description available'}
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded ${
                          participant.status === 'draft' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {participant.status}
                        </span>
                        {participant.authors.length > 0 && (
                          <span>by {participant.authors[0].name}</span>
                        )}
                      </div>
                      <div>
                        {new Date(participant.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};