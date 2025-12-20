// LLM Service for AI-powered role-playing scenarios
import EdgeFunctionClient from './edgeFunctions';

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMResponse {
  content: string;
  emotionalTone: EmotionalTone;
  coaching?: CoachingFeedback;
}

export interface EmotionalTone {
  primary: 'professional' | 'empathetic' | 'urgent' | 'frustrated' | 'confused' | 'neutral';
  confidence: number; // 0-1
  detected: string[]; // List of emotions detected
}

export interface CoachingFeedback {
  score: number; // 0-100
  strengths: string[];
  improvements: string[];
  tonalSuggestions: string[];
}

export interface ScenarioContext {
  scenarioType: 'medical' | 'legal' | 'business' | 'emergency';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  currentRole: 'doctor' | 'patient' | 'lawyer' | 'client' | 'other';
  targetTone: string;
  conversationHistory: LLMMessage[];
}

export class LLMService {
  private apiKey: string;
  private apiEndpoint: string;
  private model: string;
  private provider: 'openai' | 'anthropic' | 'custom';
  private useEdgeFunction: boolean;

  constructor(config: {
    apiKey: string;
    provider?: 'openai' | 'anthropic' | 'custom';
    apiEndpoint?: string;
    model?: string;
    useEdgeFunction?: boolean;
  }) {
    this.apiKey = config.apiKey;
    this.provider = config.provider || 'openai';
    this.useEdgeFunction = config.useEdgeFunction ?? false;
    
    // Set defaults based on provider
    if (this.provider === 'openai') {
      this.apiEndpoint = config.apiEndpoint || 'https://api.openai.com/v1/chat/completions';
      this.model = config.model || 'gpt-4o-mini';
    } else if (this.provider === 'anthropic') {
      this.apiEndpoint = config.apiEndpoint || 'https://api.anthropic.com/v1/messages';
      this.model = config.model || 'claude-3-5-sonnet-20241022';
    } else {
      this.apiEndpoint = config.apiEndpoint || '';
      this.model = config.model || '';
    }
  }

  async generateResponse(context: ScenarioContext, userInput: string): Promise<LLMResponse> {
    try {
      // Build the conversation with system prompt
      const messages = this.buildMessages(context, userInput);

      // Make API call based on provider
      const response = await this.callLLMAPI(messages);

      // Analyze emotional tone
      const emotionalTone = await this.analyzeEmotionalTone(response, context);

      // Generate coaching feedback
      const coaching = await this.generateCoachingFeedback(
        userInput,
        response,
        context,
        emotionalTone
      );

      return {
        content: response,
        emotionalTone,
        coaching,
      };
    } catch (error) {
      console.error('LLM Service Error:', error);
      throw new Error('Failed to generate AI response');
    }
  }

  private buildMessages(context: ScenarioContext, userInput: string): LLMMessage[] {
    const systemPrompt = this.buildSystemPrompt(context);
    
    const messages: LLMMessage[] = [
      { role: 'system', content: systemPrompt },
      ...context.conversationHistory,
      { role: 'user', content: userInput },
    ];

    return messages;
  }

  private buildSystemPrompt(context: ScenarioContext): string {
    const roleInstructions = this.getRoleInstructions(context.currentRole);
    
    return `You are playing the role of a ${context.currentRole} in a ${context.scenarioType} interpretation scenario.

SCENARIO CONTEXT:
- Type: ${context.scenarioType}
- Difficulty: ${context.difficulty}
- Your Role: ${context.currentRole}
- Target Tone: ${context.targetTone}

ROLE INSTRUCTIONS:
${roleInstructions}

COMMUNICATION GUIDELINES:
1. Respond naturally and authentically as the ${context.currentRole}
2. Use appropriate medical/legal/business terminology based on scenario type
3. Maintain consistent emotional state throughout the conversation
4. Provide realistic reactions to the interpreter's tone and word choices
5. Include natural speech patterns (pauses, hesitations, clarifications)
6. Stay in character - do not break the fourth wall

RESPONSE FORMAT:
- Keep responses concise (1-3 sentences typically)
- Use natural, conversational language
- Show appropriate emotional reactions
- Ask clarifying questions when needed

Remember: You are NOT the interpreter. You are the ${context.currentRole} speaking their native language, and the human user is the interpreter translating your words.`;
  }

  private getRoleInstructions(role: string): string {
    const instructions: Record<string, string> = {
      doctor: `As a doctor:
- Be professional but empathetic
- Use medical terminology appropriately
- Show concern for patient wellbeing
- Ask detailed questions about symptoms
- Provide clear medical instructions`,
      
      patient: `As a patient:
- Express genuine concern about your condition
- May be anxious, confused, or in pain
- Ask questions about diagnosis and treatment
- React emotionally to medical news
- May struggle to understand medical terms`,
      
      lawyer: `As a lawyer:
- Be precise and formal
- Use legal terminology accurately
- Focus on facts and evidence
- Be analytical and logical
- Maintain professional demeanor`,
      
      client: `As a client:
- Express concerns about your legal situation
- May be stressed or worried
- Ask questions about your rights and options
- React to legal advice appropriately
- May not understand legal jargon`,
      
      other: `Stay in character and respond authentically based on your role in this scenario.`,
    };

    return instructions[role] || instructions.other;
  }

  private async callLLMAPI(messages: LLMMessage[]): Promise<string> {
    // Use edge function if enabled and available
    if (this.useEdgeFunction) {
      try {
        const isAvailable = await EdgeFunctionClient.isAvailable();
        if (isAvailable) {
          const response = await EdgeFunctionClient.llmChat({
            provider: this.provider as 'openai' | 'anthropic',
            model: this.model,
            messages,
            temperature: 0.8,
            maxTokens: 200,
            apiKey: this.apiKey,
          });
          return response.content;
        }
      } catch (error) {
        console.warn('Edge function unavailable, falling back to direct API:', error);
      }
    }

    // Fallback to direct API calls
    if (this.provider === 'openai') {
      return this.callOpenAI(messages);
    } else if (this.provider === 'anthropic') {
      return this.callAnthropic(messages);
    } else {
      throw new Error('Custom provider not implemented');
    }
  }

  private async callOpenAI(messages: LLMMessage[]): Promise<string> {
    const response = await fetch(this.apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages: messages,
        temperature: 0.8,
        max_tokens: 200,
        presence_penalty: 0.6,
        frequency_penalty: 0.3,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenAI API Error: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  }

  private async callAnthropic(messages: LLMMessage[]): Promise<string> {
    // Extract system message
    const systemMessage = messages.find(m => m.role === 'system')?.content || '';
    const conversationMessages = messages.filter(m => m.role !== 'system');

    const response = await fetch(this.apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: 200,
        system: systemMessage,
        messages: conversationMessages,
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Anthropic API Error: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data.content[0]?.text || '';
  }

  private async analyzeEmotionalTone(
    response: string,
    context: ScenarioContext
  ): Promise<EmotionalTone> {
    // Simple keyword-based emotion detection
    // In production, you'd use a dedicated sentiment analysis API or model
    
    const emotionKeywords = {
      professional: ['please', 'kindly', 'would you', 'could you', 'thank you'],
      empathetic: ['understand', 'sorry', 'concern', 'help', 'care', 'worried'],
      urgent: ['immediately', 'now', 'quickly', 'urgent', 'emergency', 'right away'],
      frustrated: ['again', 'already told', 'repeat', 'why', 'how many times'],
      confused: ['what', 'unclear', 'understand', 'explain', 'mean', '?'],
      neutral: [],
    };

    const lowerResponse = response.toLowerCase();
    const detected: string[] = [];
    const scores: Record<string, number> = {};

    // Count keyword matches
    for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
      const matches = keywords.filter(keyword => lowerResponse.includes(keyword)).length;
      if (matches > 0) {
        scores[emotion] = matches;
        detected.push(emotion);
      }
    }

    // Determine primary emotion
    let primary: EmotionalTone['primary'] = 'neutral';
    let maxScore = 0;
    
    for (const [emotion, score] of Object.entries(scores)) {
      if (score > maxScore) {
        maxScore = score;
        primary = emotion as EmotionalTone['primary'];
      }
    }

    // Calculate confidence based on keyword density
    const wordCount = response.split(/\s+/).length;
    const confidence = Math.min(maxScore / wordCount * 5, 1);

    return {
      primary,
      confidence: confidence || 0.5,
      detected: detected.length > 0 ? detected : ['neutral'],
    };
  }

  private async generateCoachingFeedback(
    userInput: string,
    aiResponse: string,
    context: ScenarioContext,
    emotionalTone: EmotionalTone
  ): Promise<CoachingFeedback> {
    const strengths: string[] = [];
    const improvements: string[] = [];
    const tonalSuggestions: string[] = [];

    // Analyze user input quality
    const inputWords = userInput.trim().split(/\s+/);
    const hasGoodLength = inputWords.length >= 5 && inputWords.length <= 50;
    const hasPoliteness = /please|thank you|kindly|excuse me/i.test(userInput);
    const hasClarity = !/um|uh|like|you know/i.test(userInput.toLowerCase());

    // Evaluate strengths
    if (hasGoodLength) {
      strengths.push('Appropriate response length');
    }
    if (hasPoliteness) {
      strengths.push('Professional and polite language');
    }
    if (hasClarity) {
      strengths.push('Clear articulation without filler words');
    }

    // Identify improvements
    if (!hasGoodLength) {
      if (inputWords.length < 5) {
        improvements.push('Provide more detailed responses');
      } else {
        improvements.push('Keep responses more concise');
      }
    }
    if (!hasPoliteness && context.targetTone.toLowerCase().includes('professional')) {
      improvements.push('Include more courteous language');
    }
    if (!hasClarity) {
      improvements.push('Eliminate filler words for clearer interpretation');
    }

    // Tonal suggestions based on context
    const targetTone = context.targetTone.toLowerCase();
    if (targetTone.includes('empathetic') && !emotionalTone.detected.includes('empathetic')) {
      tonalSuggestions.push('Show more empathy in your interpretation');
    }
    if (targetTone.includes('professional') && emotionalTone.primary !== 'professional') {
      tonalSuggestions.push('Maintain a more formal, professional tone');
    }
    if (targetTone.includes('calm') && emotionalTone.detected.includes('urgent')) {
      tonalSuggestions.push('Use a calmer tone to de-escalate the situation');
    }

    // Calculate score (0-100)
    const totalChecks = 3;
    const passedChecks = [hasGoodLength, hasPoliteness, hasClarity].filter(Boolean).length;
    const baseScore = (passedChecks / totalChecks) * 100;
    const score = Math.round(baseScore);

    return {
      score,
      strengths: strengths.length > 0 ? strengths : ['Keep practicing to improve'],
      improvements: improvements.length > 0 ? improvements : [],
      tonalSuggestions: tonalSuggestions.length > 0 ? tonalSuggestions : ['Tone is appropriate'],
    };
  }

  async generateScenarioOpening(context: ScenarioContext): Promise<string> {
    const messages: LLMMessage[] = [
      {
        role: 'system',
        content: this.buildSystemPrompt(context),
      },
      {
        role: 'user',
        content: 'Begin the scenario. Provide your opening statement.',
      },
    ];

    return this.callLLMAPI(messages);
  }
}

// Factory function to create LLM service instance
export function createLLMService(apiKey: string, provider: 'openai' | 'anthropic' = 'openai'): LLMService {
  return new LLMService({ apiKey, provider });
}
