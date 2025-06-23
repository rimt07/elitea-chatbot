export interface Participant {
  entity_name: string;
  entity_meta: {
    integration_uid: string;
    model_name: string;
  };
  entity_settings: {
    max_tokens: number;
    top_p: number;
    top_k: number;
    temperature: number;
  };
}

export interface Conversation {
  id?: number;
  name: string;
  is_private: boolean;
  source: string;
  participants: Participant[];
  created_at?: string;
}

export interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  streaming?: boolean;
}

export interface ApiResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export interface ModelSettings {
  temperature: number;
  top_k: number;
  top_p: number;
  max_tokens: number;
  stream: boolean;
  model: {
    model_name: string;
    integration_uid: string;
    integration_name: string;
  };
}

export interface PredictRequest {
  type: string;
  model_settings: ModelSettings;
  variables: Array<{
    name: string;
    value: string;
  }>;
  user_input: string;
  format_response: boolean;
}