// Supabase Edge Function Client
// Handles secure communication with Supabase edge functions

import { supabase } from './supabase';

export interface EdgeFunctionError {
  message: string;
  code?: string;
}

export interface LLMChatRequest {
  provider: 'openai' | 'anthropic';
  model: string;
  messages: Array<{ role: string; content: string }>;
  temperature?: number;
  maxTokens?: number;
  apiKey?: string;
}

export interface LLMChatResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model: string;
}

export interface SaveConversationRequest {
  sessionId?: string;
  scenarioType: string;
  currentRole: string;
  conversationData: Record<string, unknown>;
  coachingFeedback?: Record<string, unknown>;
  emotionalToneAnalysis?: Record<string, unknown>;
  totalMessages: number;
  sessionScore?: number;
}

export interface SaveConversationResponse {
  success: boolean;
  conversationId: string;
}

export class EdgeFunctionClient {
  /**
   * Call the LLM chat edge function
   * Handles OpenAI and Anthropic API calls securely from server
   */
  static async llmChat(request: LLMChatRequest): Promise<LLMChatResponse> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Not authenticated. Please sign in to use AI features.');
      }

      const response = await supabase.functions.invoke('llm-chat', {
        body: request,
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to call LLM API');
      }

      return response.data as LLMChatResponse;
    } catch (error) {
      console.error('Edge function llm-chat error:', error);
      throw error instanceof Error ? error : new Error('Unknown error occurred');
    }
  }

  /**
   * Save conversation to database
   * Stores AI conversation history, coaching, and emotional analysis
   */
  static async saveConversation(request: SaveConversationRequest): Promise<SaveConversationResponse> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Not authenticated. Please sign in to save conversations.');
      }

      const response = await supabase.functions.invoke('save-conversation', {
        body: request,
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to save conversation');
      }

      return response.data as SaveConversationResponse;
    } catch (error) {
      console.error('Edge function save-conversation error:', error);
      throw error instanceof Error ? error : new Error('Unknown error occurred');
    }
  }

  /**
   * Check if edge functions are available and user is authenticated
   */
  static async isAvailable(): Promise<boolean> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return !!session;
    } catch {
      return false;
    }
  }
}

export default EdgeFunctionClient;
