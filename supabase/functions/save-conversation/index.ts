// Supabase Edge Function to Save AI Conversations
// Stores conversation data, coaching feedback, and emotional analysis

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CoachingFeedback {
  score?: number;
  strengths?: string[];
  improvements?: string[];
  nextSteps?: string[];
}

interface ConversationData {
  sessionId?: string;
  scenarioType: string;
  currentRole: string;
  conversationData: Record<string, unknown>;
  coachingFeedback?: CoachingFeedback;
  emotionalToneAnalysis?: Record<string, unknown>;
  totalMessages: number;
  sessionScore?: number;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
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
    const data: ConversationData = await req.json();

    // Insert conversation record
    const { data: conversation, error: insertError } = await supabaseClient
      .from('ai_conversations')
      .insert({
        user_id: user.id,
        session_id: data.sessionId || null,
        scenario_type: data.scenarioType,
        current_role: data.currentRole,
        conversation_data: data.conversationData,
        coaching_feedback: data.coachingFeedback || null,
        emotional_tone_analysis: data.emotionalToneAnalysis || null,
        total_messages: data.totalMessages,
        session_score: data.sessionScore || null,
        completed_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        conversationId: conversation.id 
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Save conversation error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Failed to save conversation' 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
