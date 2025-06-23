# Elitea AI Chatbot

A production-ready React chatbot that integrates with the Elitea API for AI-powered conversations.

## Features

- 🤖 AI-powered conversations using Elitea API
- 💬 Real-time streaming responses
- 👥 Participant management with customizable settings
- 🔧 Conversation management
- 📱 Responsive floating button interface
- 🎨 Modern, production-ready design
- 🔒 Secure environment variable configuration

## Setup

1. **Environment Configuration**
   
   Copy the example environment file and configure your API credentials:
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and add your Elitea API credentials:
   ```env
   VITE_ELITEA_API_URL=https://nexus.elitea.ai/api/v1
   VITE_ELITEA_BEARER_TOKEN=your_bearer_token_here
   VITE_ELITEA_COOKIE=your_cookie_here
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

## Security

- Bearer tokens and sensitive API credentials are stored in environment variables
- Never commit `.env` files to version control
- Use `.env.example` as a template for required environment variables
- The application will show an error if required environment variables are missing

## API Integration

The chatbot integrates with three main Elitea API endpoints:

- **Create Conversations**: `/chat/conversations/prompt_lib/42`
- **Add Participants**: `/chat/participants/prompt_lib/42/{conversationId}`
- **Send Messages**: `/prompt_lib/predict/prompt_lib/42`

## Usage

1. Click the floating button to open the chatbot
2. Create a new conversation or select an existing one
3. Manage participants and their AI model settings
4. Start chatting with your AI assistant
5. Attach datasources and prompts (coming soon)

## Production Deployment

Before deploying to production:

1. Set up environment variables in your hosting platform
2. Ensure your bearer token is kept secure
3. Consider implementing token refresh mechanisms
4. Set up proper CORS policies if needed

## Development

The project uses:
- React 18 with TypeScript
- Tailwind CSS for styling
- Lucide React for icons
- Vite for development and building