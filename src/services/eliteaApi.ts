import { Conversation, Participant, PredictRequest, ApiResponse } from '../types';
import { apiConfig } from '../config/api';

class EliteaApiService {
  private headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiConfig.bearerToken}`,
    ...(apiConfig.cookie && { 'Cookie': apiConfig.cookie })
  };

  async createConversation(conversation: Conversation): Promise<ApiResponse> {
    try {
      const response = await fetch(`${apiConfig.baseUrl}/chat/conversations/prompt_lib/42`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(conversation)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create conversation' 
      };
    }
  }

  async addParticipants(conversationId: number, participants: Participant[]): Promise<ApiResponse> {
    try {
      const response = await fetch(`${apiConfig.baseUrl}/chat/participants/prompt_lib/42/${conversationId}`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(participants)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to add participants' 
      };
    }
  }

  async sendMessage(request: PredictRequest): Promise<ApiResponse> {
    try {
      const response = await fetch(`${apiConfig.baseUrl}/prompt_lib/predict/prompt_lib/42`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to send message' 
      };
    }
  }

  async addAvailableParticipant(conversationId: number, participantId: number): Promise<ApiResponse> {
    try {
      const requestBody = {
        entity_name: "user",
        entity_meta: {
          id: participantId
        },
        meta: {},
        entity_settings: {
          test: 42
        }
      };

      const response = await fetch(`${apiConfig.baseUrl}/chat/participants/prompt_lib/42/${conversationId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiConfig.bearerToken}`,
          'Cookie': apiConfig.cookie
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to add available participant' 
      };
    }
  }

  async getAvailableParticipants(limit: number = 10): Promise<ApiResponse> {
    try {
      // Use specific headers for this endpoint based on the working curl example
      const headers = {
        'Authorization': `Bearer ${apiConfig.bearerToken}`,
        'Cookie': apiConfig.cookie
      };
      
      const url = `${apiConfig.baseUrl}/applications/applications/prompt_lib/42?limit=${limit}&agents_type=all`;
      console.log('Fetching participants from URL:', url);
      console.log('Headers:', headers);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: headers
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch available participants' 
      };
    }
  }

  async streamMessage(request: PredictRequest, onChunk: (chunk: string) => void): Promise<ApiResponse> {
    try {
      // First try streaming
      const streamRequest = { ...request, model_settings: { ...request.model_settings, stream: true } };
      const response = await fetch(`${apiConfig.baseUrl}/prompt_lib/predict/prompt_lib/42`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(streamRequest)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Check if response is streaming (has readable stream)
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('text/plain') || contentType?.includes('text/event-stream')) {
        // Handle streaming response
        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error('No response body');
        }

        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data !== '[DONE]') {
                try {
                  const parsed = JSON.parse(data);
                  if (parsed.content) {
                    onChunk(parsed.content);
                  }
                } catch {
                  // Ignore parsing errors
                }
              }
            }
          }
        }
      } else {
        // Handle JSON response (non-streaming)
        const data = await response.json();
        
        // Extract content from the response format you provided
        if (data.messages && Array.isArray(data.messages)) {
          // Sort messages by timestamp if available, or use array order
          const sortedMessages = data.messages.sort((a, b) => {
            // If there's a timestamp in response_metadata, use it
            const timeA = a.response_metadata?.ResponseMetadata?.HTTPHeaders?.date;
            const timeB = b.response_metadata?.ResponseMetadata?.HTTPHeaders?.date;
            
            if (timeA && timeB) {
              return new Date(timeA).getTime() - new Date(timeB).getTime();
            }
            
            // Otherwise maintain array order
            return 0;
          });

          // Send each message content as a chunk
          for (const message of sortedMessages) {
            if (message.content) {
              onChunk(message.content);
            }
          }
        } else if (data.content) {
          // Fallback for direct content
          onChunk(data.content);
        }
      }

      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to stream message' 
      };
    }
  }
}

export const eliteaApi = new EliteaApiService();