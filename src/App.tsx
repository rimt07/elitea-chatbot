import React, { useState } from 'react';
import { FloatingButton } from './components/FloatingButton';
import { ChatBot } from './components/ChatBot';

function App() {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Demo content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-800 mb-6">
            Elitea AI Assistant Integration
          </h1>
          
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Welcome to Your AI-Powered Experience
            </h2>
            <p className="text-gray-600 mb-6">
              This page demonstrates the Elitea AI chatbot integration. The floating button in the 
              bottom-right corner provides access to a full-featured AI assistant that can:
            </p>
            
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-2">🤖 AI Conversations</h3>
                <p className="text-gray-600 text-sm">
                  Create and manage conversations with advanced AI models powered by Elitea's API.
                </p>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-2">👥 Participant Management</h3>
                <p className="text-gray-600 text-sm">
                  Add and configure AI participants with custom settings for temperature, tokens, and more.
                </p>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-2">📊 Datasource Integration</h3>
                <p className="text-gray-600 text-sm">
                  Attach datasources to conversations for context-aware AI responses.
                </p>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-2">⚡ Real-time Streaming</h3>
                <p className="text-gray-600 text-sm">
                  Experience smooth, real-time AI responses with streaming capabilities.
                </p>
              </div>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-blue-800 text-sm">
                <strong>Try it now:</strong> Click the floating button to start a conversation with 
                your AI assistant. Create new conversations, manage participants, and experience 
                the power of Elitea's AI platform.
              </p>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              About This Integration
            </h2>
            <p className="text-gray-600 mb-4">
              This chatbot is built using React and integrates seamlessly with Elitea's API to provide 
              enterprise-grade AI capabilities. The floating interface ensures it can be embedded in 
              any webpage without disrupting the user experience.
            </p>
            <p className="text-gray-600">
              Features include conversation management, participant configuration, datasource attachment, 
              and real-time streaming responses from state-of-the-art language models.
            </p>
          </div>
        </div>
      </div>

      {/* Floating Chatbot */}
      <FloatingButton
        isOpen={isChatOpen}
        onClick={() => setIsChatOpen(!isChatOpen)}
      />
      
      <ChatBot
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />
    </div>
  );
}

export default App;