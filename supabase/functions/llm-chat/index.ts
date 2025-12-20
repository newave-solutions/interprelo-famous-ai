// Supabase Edge Function for LLM Chat
// Handles OpenAI and Anthropic API calls securely from the server

import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface LLMRequest {
  provider: 'openai' | 'anthropic';
  model: string;
  messages: Array<{ role: string; content: string }>;
  temperature?: number;
  maxTokens?: number;
  apiKey?: string; // Optional: user's own API key
}

interface LLMResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const authHeader = req.headers.get('Authorization') ?? '';
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser();

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Parse request body
    const requestData: LLMRequest = await req.json();
    const { provider, model, messages, temperature = 0.7, maxTokens = 1000, apiKey } = requestData;

    const startTime = Date.now();
    let response: LLMResponse;
    let apiResponse: Response;

    // Determine API key to use (user's key or server's key)
    const effectiveApiKey = apiKey || 
      (provider === 'openai' ? Deno.env.get('OPENAI_API_KEY') : Deno.env.get('ANTHROPIC_API_KEY'));

    if (!effectiveApiKey) {
      return new Response(
        JSON.stringify({ error: `No API key configured for ${provider}` }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Call appropriate LLM provider
    if (provider === 'openai') {
      apiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${effectiveApiKey}`,
        },
        body: JSON.stringify({
          model,
          messages,
          temperature,
          max_tokens: maxTokens,
        }),
      });

      if (!apiResponse.ok) {
        const error = await apiResponse.text();
        throw new Error(`OpenAI API error: ${error}`);
      }

      const data = await apiResponse.json();
      response = {
        content: data.choices[0].message.content,
        usage: {
          promptTokens: data.usage.prompt_tokens,
          completionTokens: data.usage.completion_tokens,
          totalTokens: data.usage.total_tokens,
        },
        model: data.model,
      };

    } else if (provider === 'anthropic') {
      // Convert messages format for Anthropic
      const systemMessage = messages.find(m => m.role === 'system');
      const conversationMessages = messages.filter(m => m.role !== 'system');

      apiResponse = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': effectiveApiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model,
          messages: conversationMessages,
          system: systemMessage?.content,
          temperature,
          max_tokens: maxTokens,
        }),
      });

      if (!apiResponse.ok) {
        const error = await apiResponse.text();
        throw new Error(`Anthropic API error: ${error}`);
      }

      const data = await apiResponse.json();
      response = {
        content: data.content[0].text,
        usage: {
          promptTokens: data.usage.input_tokens,
          completionTokens: data.usage.output_tokens,
          totalTokens: data.usage.input_tokens + data.usage.output_tokens,
        },
        model: data.model,
      };

    } else {
      throw new Error(`Unsupported provider: ${provider}`);
    }

    const responseTime = Date.now() - startTime;

    // Log API usage to database (async, don't wait)
    if (response.usage) {
      const costEstimate = calculateCost(provider, model, response.usage);
      
      supabaseClient.from('api_usage_logs').insert({
      user_id: user.id,
      provider,
      model,
      endpoint: provider === 'openai' ? '/v1/chat/completions' : '/v1/messages',
      prompt_tokens: response.usage?.promptTokens,
      completion_tokens: response.usage?.completionTokens,
      total_tokens: response.usage?.totalTokens,
        response_time_ms: responseTime,
        status_code: apiResponse.status,
        cost_estimate: costEstimate,
      }).then(() => {}).catch(console.error);
    }

    // Return successful response
    return new Response(
      JSON.stringify(response),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Edge function error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

// Helper function to estimate API costs
function calculateCost(
  provider: string, 
  model: string, 
  usage: { promptTokens: number; completionTokens: number }
): number {
  // Pricing as of Dec 2024 (update as needed)
  const pricing: Record<string, { input: number; output: number }> = {
    'gpt-4o': { input: 0.0025 / 1000, output: 0.01 / 1000 },
    'gpt-4o-mini': { input: 0.00015 / 1000, output: 0.0006 / 1000 },
    'gpt-4-turbo': { input: 0.01 / 1000, output: 0.03 / 1000 },
    'claude-3-5-sonnet-20241022': { input: 0.003 / 1000, output: 0.015 / 1000 },
    'claude-3-5-haiku-20241022': { input: 0.001 / 1000, output: 0.005 / 1000 },
  };

  const modelPricing = pricing[model] || { input: 0, output: 0 };
  return (
    usage.promptTokens * modelPricing.input +
    usage.completionTokens * modelPricing.output
  );
}
