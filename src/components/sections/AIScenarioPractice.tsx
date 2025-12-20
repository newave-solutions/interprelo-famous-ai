import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, MicOff, Volume2, VolumeX, MessageSquare, Send, 
  Settings, Play, Pause, RotateCcw, Sparkles, Brain,
  TrendingUp, AlertCircle, CheckCircle, Info
} from 'lucide-react';
import { LLMService, ScenarioContext, LLMMessage, CoachingFeedback, EmotionalTone } from '@/lib/llmService';
import { SpeechService, TranscriptResult } from '@/lib/speechService';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import ProgressRing from '@/components/ui/ProgressRing';

interface Message {
  id: string;
  role: 'ai' | 'user' | 'system';
  content: string;
  emotionalTone?: EmotionalTone;
  coaching?: CoachingFeedback;
  timestamp: Date;
}

interface AIScenarioPracticeProps {
  scenarioType: 'medical' | 'legal' | 'business' | 'emergency';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  aiRole: 'doctor' | 'patient' | 'lawyer' | 'client' | 'other';
  targetTone: string;
  apiKey?: string;
  onClose?: () => void;
}

const AIScenarioPractice: React.FC<AIScenarioPracticeProps> = ({
  scenarioType,
  difficulty,
  aiRole,
  targetTone,
  apiKey,
  onClose,
}) => {
  // State
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionScore, setSessionScore] = useState(0);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [autoListen, setAutoListen] = useState(false);
  const [showCoaching, setShowCoaching] = useState(true);
  const [interimTranscript, setInterimTranscript] = useState('');

  // Refs
  const llmServiceRef = useRef<LLMService | null>(null);
  const speechServiceRef = useRef<SpeechService | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const conversationHistoryRef = useRef<LLMMessage[]>([]);

  // Initialize services
  useEffect(() => {
    if (!apiKey) {
      setError('API key not configured. Please add your OpenAI or Anthropic API key.');
      return;
    }

    const initializeServices = async () => {
      try {
        llmServiceRef.current = new LLMService({ 
          apiKey,
          provider: 'openai' // or 'anthropic' based on user preference
        });
        speechServiceRef.current = new SpeechService({ language: 'en-US' });

        // Start scenario
        await startScenario();
      } catch (err) {
        setError('Failed to initialize AI services');
        console.error(err);
      }
    };

    initializeServices();

    return () => {
      speechServiceRef.current?.stopAll();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiKey]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const startScenario = async () => {
    if (!llmServiceRef.current) return;

    setIsProcessing(true);
    try {
      const context: ScenarioContext = {
        scenarioType,
        difficulty,
        currentRole: aiRole,
        targetTone,
        conversationHistory: [],
      };

      const opening = await llmServiceRef.current.generateScenarioOpening(context);
      
      const systemMessage: Message = {
        id: Date.now().toString(),
        role: 'system',
        content: `Scenario started: ${aiRole} in ${scenarioType} setting. Difficulty: ${difficulty}. Target tone: ${targetTone}`,
        timestamp: new Date(),
      };

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: opening,
        timestamp: new Date(),
      };

      setMessages([systemMessage, aiMessage]);
      conversationHistoryRef.current.push({ role: 'assistant', content: opening });

      // Auto-speak AI response
      if (autoSpeak && speechServiceRef.current) {
        await speakText(opening);
      }
    } catch (err) {
      setError('Failed to start scenario');
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const speakText = async (text: string): Promise<void> => {
    if (!speechServiceRef.current) return;

    setIsSpeaking(true);
    try {
      await speechServiceRef.current.tts.speak(text);
    } catch (err) {
      console.error('TTS error:', err);
    } finally {
      setIsSpeaking(false);
    }
  };

  const handleStartListening = () => {
    if (!speechServiceRef.current?.stt.isSupported()) {
      setError('Speech recognition not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    setIsListening(true);
    setInterimTranscript('');

    speechServiceRef.current.stt.startListening(
      (result: TranscriptResult) => {
        if (result.isFinal) {
          setInputText(prev => prev + ' ' + result.transcript);
          setInterimTranscript('');
        } else {
          setInterimTranscript(result.transcript);
        }
      },
      (error: string) => {
        setError(`Speech recognition error: ${error}`);
        setIsListening(false);
      }
    );
  };

  const handleStopListening = () => {
    speechServiceRef.current?.stt.stopListening();
    setIsListening(false);
    setInterimTranscript('');
  };

  const handleSendMessage = async () => {
    const userMessage = inputText.trim();
    if (!userMessage || isProcessing || !llmServiceRef.current) return;

    setIsProcessing(true);
    setInputText('');
    setError(null);

    // Add user message to UI
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    conversationHistoryRef.current.push({ role: 'user', content: userMessage });

    try {
      const context: ScenarioContext = {
        scenarioType,
        difficulty,
        currentRole: aiRole,
        targetTone,
        conversationHistory: conversationHistoryRef.current,
      };

      const response = await llmServiceRef.current.generateResponse(context, userMessage);

      // Add AI response to UI
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: response.content,
        emotionalTone: response.emotionalTone,
        coaching: response.coaching,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMsg]);
      conversationHistoryRef.current.push({ role: 'assistant', content: response.content });

      // Update session score
      if (response.coaching) {
        setSessionScore(prev => Math.round((prev + response.coaching!.score) / 2));
      }

      // Auto-speak AI response
      if (autoSpeak && speechServiceRef.current) {
        await speakText(response.content);
      }

      // Auto-listen for next response
      if (autoListen && !isListening) {
        setTimeout(() => handleStartListening(), 500);
      }
    } catch (err) {
      setError('Failed to get AI response. Please check your API key and connection.');
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setMessages([]);
    setInputText('');
    setInterimTranscript('');
    setSessionScore(0);
    conversationHistoryRef.current = [];
    speechServiceRef.current?.stopAll();
    setIsListening(false);
    setIsSpeaking(false);
    startScenario();
  };

  const getEmotionColor = (emotion: string): string => {
    const colors: Record<string, string> = {
      professional: 'bg-blue-100 text-blue-700',
      empathetic: 'bg-green-100 text-green-700',
      urgent: 'bg-red-100 text-red-700',
      frustrated: 'bg-orange-100 text-orange-700',
      confused: 'bg-purple-100 text-purple-700',
      neutral: 'bg-gray-100 text-gray-700',
    };
    return colors[emotion] || colors.neutral;
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return '#4CAF50';
    if (score >= 60) return '#FFA726';
    return '#FF6B6B';
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-[#2C5F8D] to-[#1e4a6b] rounded-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">AI Role-Play Scenario</h2>
              <p className="text-sm text-gray-500">
                {aiRole} · {scenarioType} · {difficulty}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Session Score */}
            <div className="flex items-center gap-2">
              <ProgressRing
                progress={sessionScore}
                size={50}
                strokeWidth={4}
                color={getScoreColor(sessionScore)}
              >
                <span className="text-sm font-bold">{sessionScore}</span>
              </ProgressRing>
              <div className="text-left">
                <p className="text-xs text-gray-500">Session</p>
                <p className="text-xs font-semibold text-gray-700">Score</p>
              </div>
            </div>

            {/* Controls */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                disabled={isProcessing}
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
              {onClose && (
                <Button variant="outline" size="sm" onClick={onClose}>
                  Close
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Settings Row */}
        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={autoSpeak}
              onChange={(e) => setAutoSpeak(e.target.checked)}
              className="rounded"
            />
            <Volume2 className="w-4 h-4" />
            Auto-speak AI
          </label>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={autoListen}
              onChange={(e) => setAutoListen(e.target.checked)}
              className="rounded"
            />
            <Mic className="w-4 h-4" />
            Auto-listen
          </label>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={showCoaching}
              onChange={(e) => setShowCoaching(e.target.checked)}
              className="rounded"
            />
            <Brain className="w-4 h-4" />
            Show coaching
          </label>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-3 m-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800">Error</p>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[80%] ${message.role === 'system' ? 'w-full' : ''}`}>
              {message.role === 'system' ? (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                  <Info className="w-4 h-4 inline mr-2 text-blue-600" />
                  <span className="text-sm text-blue-700">{message.content}</span>
                </div>
              ) : (
                <>
                  <div
                    className={`rounded-2xl p-4 ${
                      message.role === 'ai'
                        ? 'bg-white border border-gray-200'
                        : 'bg-[#2C5F8D] text-white'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="text-xs font-semibold opacity-70">
                        {message.role === 'ai' ? aiRole : 'You (Interpreter)'}
                      </span>
                      {message.emotionalTone && (
                        <Badge
                          variant="secondary"
                          className={`text-xs ${getEmotionColor(message.emotionalTone.primary)}`}
                        >
                          {message.emotionalTone.primary}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm leading-relaxed">{message.content}</p>
                  </div>

                  {/* Coaching Feedback */}
                  {showCoaching && message.coaching && message.role === 'ai' && (
                    <div className="mt-2 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Brain className="w-4 h-4 text-purple-600" />
                        <span className="text-xs font-semibold text-purple-900">
                          AI Coaching Feedback
                        </span>
                        <Badge variant="secondary" className="ml-auto">
                          {message.coaching.score}/100
                        </Badge>
                      </div>

                      {message.coaching.strengths.length > 0 && (
                        <div className="mb-2">
                          <p className="text-xs font-medium text-green-700 mb-1">✓ Strengths:</p>
                          <ul className="text-xs text-green-600 space-y-0.5">
                            {message.coaching.strengths.map((s, i) => (
                              <li key={i}>• {s}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {message.coaching.improvements.length > 0 && (
                        <div className="mb-2">
                          <p className="text-xs font-medium text-orange-700 mb-1">
                            ⚠ Areas to Improve:
                          </p>
                          <ul className="text-xs text-orange-600 space-y-0.5">
                            {message.coaching.improvements.map((i, idx) => (
                              <li key={idx}>• {i}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {message.coaching.tonalSuggestions.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-blue-700 mb-1">
                            💡 Tonal Suggestions:
                          </p>
                          <ul className="text-xs text-blue-600 space-y-0.5">
                            {message.coaching.tonalSuggestions.map((t, idx) => (
                              <li key={idx}>• {t}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 p-4">
        {interimTranscript && (
          <div className="mb-2 text-sm text-gray-500 italic">
            Listening: {interimTranscript}...
          </div>
        )}

        <div className="flex items-end gap-2">
          <div className="flex-1">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Type your interpretation or use voice input..."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-[#2C5F8D]"
              rows={2}
              disabled={isProcessing || isListening}
            />
          </div>

          <Button
            onClick={isListening ? handleStopListening : handleStartListening}
            variant={isListening ? 'destructive' : 'outline'}
            disabled={isProcessing || isSpeaking}
            className="h-12 w-12"
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </Button>

          <Button
            onClick={handleSendMessage}
            disabled={!inputText.trim() || isProcessing || isListening}
            className="h-12 px-6 bg-[#2C5F8D] hover:bg-[#234B73]"
          >
            {isProcessing ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </div>

        <p className="mt-2 text-xs text-gray-500 text-center">
          Press Enter to send • Shift+Enter for new line • Click mic for voice input
        </p>
      </div>
    </div>
  );
};

export default AIScenarioPractice;
