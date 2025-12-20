// Speech Services for Text-to-Speech and Speech-to-Text

export interface SpeechConfig {
  language?: string;
  voice?: string;
  rate?: number; // 0.1 to 10
  pitch?: number; // 0 to 2
  volume?: number; // 0 to 1
}

export interface TranscriptResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
}

// Text-to-Speech Service
export class TextToSpeechService {
  private synthesis: SpeechSynthesis;
  private voices: SpeechSynthesisVoice[] = [];
  private config: Required<SpeechConfig>;

  constructor(config?: SpeechConfig) {
    this.synthesis = window.speechSynthesis;
    this.config = {
      language: config?.language || 'en-US',
      voice: config?.voice || '',
      rate: config?.rate || 1.0,
      pitch: config?.pitch || 1.0,
      volume: config?.volume || 1.0,
    };

    // Load voices
    this.loadVoices();
    
    // Voices might load asynchronously
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = () => this.loadVoices();
    }
  }

  private loadVoices(): void {
    this.voices = this.synthesis.getVoices();
  }

  getAvailableVoices(): SpeechSynthesisVoice[] {
    return this.voices;
  }

  getVoicesByLanguage(language: string): SpeechSynthesisVoice[] {
    return this.voices.filter(voice => voice.lang.startsWith(language));
  }

  async speak(text: string, config?: Partial<SpeechConfig>): Promise<void> {
    return new Promise((resolve, reject) => {
      // Cancel any ongoing speech
      this.synthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      
      // Apply configuration
      const finalConfig = { ...this.config, ...config };
      utterance.lang = finalConfig.language;
      utterance.rate = finalConfig.rate;
      utterance.pitch = finalConfig.pitch;
      utterance.volume = finalConfig.volume;

      // Set voice if specified
      if (finalConfig.voice) {
        const voice = this.voices.find(v => v.name === finalConfig.voice);
        if (voice) {
          utterance.voice = voice;
        }
      } else {
        // Auto-select best voice for language
        const voice = this.voices.find(v => v.lang === finalConfig.language && v.localService);
        if (voice) {
          utterance.voice = voice;
        }
      }

      utterance.onend = () => resolve();
      utterance.onerror = (event) => reject(event);

      this.synthesis.speak(utterance);
    });
  }

  pause(): void {
    if (this.synthesis.speaking && !this.synthesis.paused) {
      this.synthesis.pause();
    }
  }

  resume(): void {
    if (this.synthesis.paused) {
      this.synthesis.resume();
    }
  }

  stop(): void {
    this.synthesis.cancel();
  }

  isSpeaking(): boolean {
    return this.synthesis.speaking;
  }

  isPaused(): boolean {
    return this.synthesis.paused;
  }
}

// Speech-to-Text Service
export class SpeechToTextService {
  private recognition: SpeechRecognitionInterface | null = null;
  private isListening: boolean = false;
  private config: Required<SpeechConfig>;

  constructor(config?: SpeechConfig) {
    this.config = {
      language: config?.language || 'en-US',
      voice: config?.voice || '',
      rate: config?.rate || 1.0,
      pitch: config?.pitch || 1.0,
      volume: config?.volume || 1.0,
    };

    this.initializeRecognition();
  }

  private initializeRecognition(): void {
    const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognitionClass) {
      console.warn('Speech Recognition not supported in this browser');
      return;
    }

    this.recognition = new SpeechRecognitionClass();
    this.recognition.continuous = false;
    this.recognition.interimResults = true;
    this.recognition.lang = this.config.language;
  }

  isSupported(): boolean {
    return this.recognition !== null;
  }

  startListening(
    onResult: (result: TranscriptResult) => void,
    onError?: (error: string) => void
  ): void {
    if (!this.recognition) {
      onError?.('Speech recognition not supported');
      return;
    }

    if (this.isListening) {
      console.warn('Already listening');
      return;
    }

    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript;
        const confidence = result[0].confidence;
        const isFinal = result.isFinal;

        onResult({
          transcript,
          confidence,
          isFinal,
        });
      }
    };

    this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      onError?.(event.error);
      this.isListening = false;
    };

    this.recognition.onend = () => {
      this.isListening = false;
    };

    try {
      this.recognition.start();
      this.isListening = true;
    } catch (error) {
      console.error('Failed to start speech recognition:', error);
      onError?.('Failed to start listening');
    }
  }

  stopListening(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  setLanguage(language: string): void {
    this.config.language = language;
    if (this.recognition) {
      this.recognition.lang = language;
    }
  }

  getIsListening(): boolean {
    return this.isListening;
  }
}

// Combined Speech Service for easier usage
export class SpeechService {
  public tts: TextToSpeechService;
  public stt: SpeechToTextService;

  constructor(config?: SpeechConfig) {
    this.tts = new TextToSpeechService(config);
    this.stt = new SpeechToTextService(config);
  }

  async speakAndListen(
    textToSpeak: string,
    onTranscript: (result: TranscriptResult) => void,
    onError?: (error: string) => void
  ): Promise<void> {
    // Speak first
    await this.tts.speak(textToSpeak);
    
    // Then start listening
    this.stt.startListening(onTranscript, onError);
  }

  stopAll(): void {
    this.tts.stop();
    this.stt.stopListening();
  }
}

// Type declarations for Speech Recognition (similar to audioAnalysis.ts)
interface SpeechRecognitionInterface extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognitionInterface;
    webkitSpeechRecognition?: new () => SpeechRecognitionInterface;
  }
}
