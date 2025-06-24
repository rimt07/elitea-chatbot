# Elitea AI Chatbot Development Prompt

## Executive Summary
Create a production-ready React TypeScript chatbot application that integrates with the Elitea AI API. The application should provide a floating button interface for AI-powered conversations with real-time streaming responses, participant management, and conversation handling.

## Core Requirements

### 1. Application Architecture
- **Framework**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS with custom design system
- **Icons**: Lucide React exclusively
- **State Management**: React hooks (useState, useEffect)
- **API Integration**: Custom service layer with proper error handling

### 2. Design Requirements
- **Aesthetic**: Production-worthy, Apple-level design quality
- **Responsive**: Mobile-first approach with proper breakpoints
- **Interactions**: Smooth animations, hover states, micro-interactions
- **Color System**: Comprehensive palette with 6+ color ramps
- **Typography**: Maximum 3 font weights, proper line spacing
- **Spacing**: Consistent 8px spacing system

### 3. Core Components Structure

#### 3.1 FloatingButton Component
```typescript
interface FloatingButtonProps {
  isOpen: boolean;
  onClick: () => void;
  unreadCount?: number;
}
```
- Fixed positioning (bottom-right)
- Gradient background (blue to purple)
- Smooth open/close animations
- Unread message indicator
- Hover and active states

#### 3.2 ChatBot Component (Main Container)
```typescript
interface ChatBotProps {
  isOpen: boolean;
  onClose: () => void;
}
```
- Modal overlay with backdrop
- Resizable interface (minimized/maximized states)
- Panel navigation system
- API error handling display
- Loading states management

#### 3.3 ConversationPanel Component
```typescript
interface ConversationPanelProps {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  onCreateConversation: (conversation: Conversation) => void;
  onSelectConversation: (conversation: Conversation) => void;
  onShowParticipants: () => void;
  onShowDatasources: () => void;
}
```
- Conversation list with search/filter
- New conversation creation form
- Conversation selection interface
- Navigation to other panels

#### 3.4 ParticipantPanel Component
```typescript
interface ParticipantPanelProps {
  participants: Participant[];
  onAddParticipant: (participant: Participant) => void;
  onUpdateParticipants: (participant: Participant) => void;
  onRemoveParticipant: (index: number) => void;
  onUpdateParticipant: (index: number, participant: Participant) => void;
  onBack: () => void;
  conversationId?: number;
}
```
- Tabbed interface (Current/Available participants)
- Participant configuration forms
- Search functionality for available participants
- Real-time participant management

#### 3.5 MessagePanel Component
```typescript
interface MessagePanelProps {
  messages: Message[];
  onSendMessage: (message: string, targetParticipant?: Participant) => void;
  isLoading: boolean;
  participants?: Participant[];
}
```
- Message history display
- Real-time streaming message updates
- Participant mention system (@mentions)
- Message input with send functionality
- Typing indicators and loading states

### 4. API Integration Requirements

#### 4.1 Environment Configuration
```typescript
// Required environment variables
VITE_ELITEA_API_URL=https://nexus.elitea.ai/api/v1
VITE_ELITEA_BEARER_TOKEN=your_bearer_token_here
VITE_ELITEA_COOKIE=your_cookie_here
```

#### 4.2 API Service Methods
```typescript
class EliteaApiService {
  // Create new conversation
  createConversation(conversation: Conversation): Promise<ApiResponse>
  
  // Add participants to conversation
  addParticipants(conversationId: number, participants: Participant[]): Promise<ApiResponse>
  
  // Send message with streaming support
  streamMessage(request: PredictRequest, onChunk: (chunk: string) => void): Promise<ApiResponse>
  
  // Get available participants
  getAvailableParticipants(limit?: number): Promise<ApiResponse>
  
  // Add available participant to conversation
  addAvailableParticipant(conversationId: number, participantId: number): Promise<ApiResponse>
}
```

#### 4.3 API Endpoints
- **Create Conversations**: `POST /chat/conversations/prompt_lib/42`
- **Manage Participants**: `POST /chat/participants/prompt_lib/42/{conversationId}`
- **Send Messages**: `POST /prompt_lib/predict/prompt_lib/42`
- **Get Available Participants**: `GET /applications/applications/prompt_lib/42`

### 5. TypeScript Interfaces

#### 5.1 Core Data Types
```typescript
interface Participant {
  id?: number;
  entity_name: string;
  entity_meta: {
    id?: number;
    integration_uid?: string;
    model_name?: string;
  };
  meta?: {
    user_name?: string;
    user_avatar?: string;
  };
  entity_settings: {
    max_tokens?: number;
    top_p?: number;
    top_k?: number;
    temperature?: number;
    test?: number;
  };
}

interface Conversation {
  id?: number;
  name: string;
  is_private: boolean;
  source: string;
  participants: Participant[];
  created_at?: string;
}

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  streaming?: boolean;
}
```

### 6. Feature Implementation Details

#### 6.1 Real-time Streaming
- Handle both streaming (`text/event-stream`) and JSON responses
- Progressive message building with chunk accumulation
- Proper error handling for stream interruptions
- Visual indicators for streaming state

#### 6.2 Participant Management
- Dynamic participant addition/removal
- Configuration forms for AI model settings
- Search and filter available participants
- Participant mention system in chat

#### 6.3 Conversation Management
- Create, select, and manage multiple conversations
- Persistent conversation state
- Conversation-specific participant lists
- Navigation between conversations

#### 6.4 Error Handling
- API configuration validation
- Network error recovery
- User-friendly error messages
- Graceful degradation

### 7. Security Requirements
- Environment variable validation
- Secure API token handling
- No sensitive data in client-side code
- Proper CORS handling

### 8. Performance Requirements
- Lazy loading for large participant lists
- Efficient message rendering
- Smooth animations (60fps)
- Minimal re-renders
- Proper cleanup of event listeners

### 9. Accessibility Requirements
- Keyboard navigation support
- Screen reader compatibility
- Proper ARIA labels
- Focus management
- Color contrast compliance

### 10. Testing Strategy
- Component unit tests
- API integration tests
- Error scenario testing
- Performance testing
- Cross-browser compatibility

## Implementation Guidelines

### Phase 1: Foundation
1. Set up project structure with TypeScript and Tailwind
2. Create basic component architecture
3. Implement API service layer
4. Add environment configuration

### Phase 2: Core Features
1. Build FloatingButton and ChatBot container
2. Implement ConversationPanel with CRUD operations
3. Create ParticipantPanel with management features
4. Build MessagePanel with streaming support

### Phase 3: Enhancement
1. Add real-time streaming functionality
2. Implement participant mention system
3. Add error handling and loading states
4. Polish animations and interactions

### Phase 4: Production Ready
1. Add comprehensive error handling
2. Implement proper loading states
3. Add accessibility features
4. Performance optimization
5. Security hardening

## Success Criteria
- ✅ Fully functional chatbot with all specified features
- ✅ Production-ready code quality and architecture
- ✅ Responsive design working across all devices
- ✅ Real-time streaming conversations
- ✅ Complete participant management system
- ✅ Proper error handling and user feedback
- ✅ Beautiful, Apple-level design aesthetic
- ✅ Comprehensive TypeScript typing
- ✅ Secure API integration

## Deliverables
1. Complete React TypeScript application
2. Comprehensive component library
3. API service integration
4. Production-ready styling
5. Documentation and setup instructions
6. Environment configuration templates

This prompt provides a complete blueprint for building a production-worthy Elitea AI chatbot application with all the specified features and requirements.