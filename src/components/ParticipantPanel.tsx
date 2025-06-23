import React, { useState } from 'react';
import { Plus, Settings, Trash2, ArrowLeft } from 'lucide-react';
import { Participant } from '../types';

interface ParticipantPanelProps {
  participants: Participant[];
  onAddParticipant: (participant: Participant) => void;
  onRemoveParticipant: (index: number) => void;
  onUpdateParticipant: (index: number, participant: Participant) => void;
  onBack: () => void;
}

export const ParticipantPanel: React.FC<ParticipantPanelProps> = ({
  participants,
  onAddParticipant,
  onRemoveParticipant,
  onUpdateParticipant,
  onBack
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
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
        <button
          onClick={() => setShowAddForm(true)}
          className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
        >
          <Plus size={20} />
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

      {/* Participants List */}
      <div className="space-y-3">
        {participants.map((participant, index) => (
          <div key={index} className="p-3 bg-white rounded-lg border">
            <div className="flex items-center justify-between mb-2">
              <div className="font-medium text-gray-800">{participant.entity_name}</div>
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
            
            <div className="text-sm text-gray-600 space-y-1">
              <div>Model: {participant.entity_meta.model_name}</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>Max Tokens: {participant.entity_settings.max_tokens}</div>
                <div>Temperature: {participant.entity_settings.temperature}</div>
                <div>Top P: {participant.entity_settings.top_p}</div>
                <div>Top K: {participant.entity_settings.top_k}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};