export interface AudioAnalysisData {
  pitch: number; // 0-100 scale
  volume: number; // 0-100 scale
  frequency: number; // Hz
  clarity: number; // 0-100 scale
}

export interface SpeechAnalysisData {
  wordsPerMinute: number;
  totalWords: number;
  transcript: string;
}

// Type declarations for Speech Recognition
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

export class AudioAnalyzer {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private microphone: MediaStreamAudioSourceNode | null = null;
  private dataArray: Uint8Array | null = null;
  private rafId: number | null = null;
  private stream: MediaStream | null = null;
  
  // Speech recognition
  private recognition: SpeechRecognitionInterface | null = null;
  private transcript: string = '';
  private wordCount: number = 0;
  private startTime: number = 0;

  async initialize(): Promise<void> {
    try {
      // Request microphone access
      this.stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });

      // Set up Web Audio API
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioContext = new AudioContextClass();
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 2048;
      this.analyser.smoothingTimeConstant = 0.8;

      this.microphone = this.audioContext.createMediaStreamSource(this.stream);
      this.microphone.connect(this.analyser);

      const bufferLength = this.analyser.frequencyBinCount;
      this.dataArray = new Uint8Array(bufferLength);

      // Initialize Speech Recognition
      const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognitionClass) {
        this.recognition = new SpeechRecognitionClass();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';

        this.recognition.onresult = (event: SpeechRecognitionEvent) => {
          let interimTranscript = '';
          let finalTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript + ' ';
              this.wordCount += transcript.trim().split(/\s+/).length;
            } else {
              interimTranscript += transcript;
            }
          }

          this.transcript = finalTranscript + interimTranscript;
        };

        this.recognition.start();
        this.startTime = Date.now();
      }
    } catch (error) {
      console.error('Error initializing audio analyzer:', error);
      throw error;
    }
  }

  startAnalysis(callback: (data: AudioAnalysisData) => void): void {
    if (!this.analyser || !this.dataArray) {
      console.error('Analyzer not initialized');
      return;
    }

    const analyze = () => {
      if (!this.analyser || !this.dataArray) return;

      const timeData = new Uint8Array(this.analyser.frequencyBinCount);
      this.analyser.getByteTimeDomainData(timeData);
      const freqData = new Uint8Array(this.analyser.frequencyBinCount);
      this.analyser.getByteFrequencyData(freqData);

      const analysisData = this.processAudioData();
      callback(analysisData);

      this.rafId = requestAnimationFrame(analyze);
    };

    analyze();
  }

  private processAudioData(): AudioAnalysisData {
    if (!this.analyser || !this.dataArray) {
      return { pitch: 0, volume: 0, frequency: 0, clarity: 0 };
    }

    // Get frequency data
    const frequencyData = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(frequencyData);

    // Calculate volume (RMS)
    let sum = 0;
    for (let i = 0; i < frequencyData.length; i++) {
      sum += frequencyData[i] * frequencyData[i];
    }
    const rms = Math.sqrt(sum / frequencyData.length);
    const volume = Math.min(100, (rms / 128) * 100);

    // Calculate dominant frequency (pitch)
    const { frequency, magnitude } = this.findDominantFrequency(frequencyData);
    
    // Convert frequency to a 0-100 scale (human speech: 85-255 Hz male, 165-255 Hz female)
    // We'll use 80-300 Hz range mapped to 0-100
    const normalizedPitch = Math.min(100, Math.max(0, ((frequency - 80) / (300 - 80)) * 100));

    // Calculate clarity based on signal strength
    const clarity = Math.min(100, (magnitude / 255) * 150);

    return {
      pitch: Math.round(normalizedPitch),
      volume: Math.round(volume),
      frequency: Math.round(frequency),
      clarity: Math.round(clarity)
    };
  }

  private findDominantFrequency(frequencyData: Uint8Array): { frequency: number; magnitude: number } {
    if (!this.audioContext) {
      return { frequency: 0, magnitude: 0 };
    }

    let maxMagnitude = 0;
    let maxIndex = 0;

    // Focus on human speech range (80-300 Hz)
    const minFreq = 80;
    const maxFreq = 300;
    const sampleRate = this.audioContext.sampleRate;
    const binSize = sampleRate / (this.analyser!.fftSize);
    
    const minBin = Math.floor(minFreq / binSize);
    const maxBin = Math.ceil(maxFreq / binSize);

    for (let i = minBin; i < maxBin && i < frequencyData.length; i++) {
      if (frequencyData[i] > maxMagnitude) {
        maxMagnitude = frequencyData[i];
        maxIndex = i;
      }
    }

    const frequency = maxIndex * binSize;
    return { frequency, magnitude: maxMagnitude };
  }

  getSpeechAnalysis(): SpeechAnalysisData {
    const elapsedMinutes = (Date.now() - this.startTime) / 60000;
    const wpm = elapsedMinutes > 0 ? Math.round(this.wordCount / elapsedMinutes) : 0;

    return {
      wordsPerMinute: wpm,
      totalWords: this.wordCount,
      transcript: this.transcript
    };
  }

  getWaveformData(): Uint8Array | null {
    if (!this.analyser || !this.dataArray) return null;
    
    const waveformData = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteTimeDomainData(waveformData);
    return waveformData;
  }

  stopAnalysis(): void {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }

    if (this.recognition) {
      this.recognition.stop();
    }
  }

  cleanup(): void {
    this.stopAnalysis();

    if (this.microphone) {
      this.microphone.disconnect();
    }

    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
    }

    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
    }

    this.audioContext = null;
    this.analyser = null;
    this.microphone = null;
    this.dataArray = null;
    this.stream = null;
    this.recognition = null;
  }
}

// Audio Recording Class
export class AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private stream: MediaStream | null = null;

  async startRecording(stream: MediaStream): Promise<void> {
    this.stream = stream;
    this.audioChunks = [];

    const options = { mimeType: 'audio/webm' };
    this.mediaRecorder = new MediaRecorder(stream, options);

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.audioChunks.push(event.data);
      }
    };

    this.mediaRecorder.start(100); // Collect data every 100ms
  }

  stopRecording(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('MediaRecorder not initialized'));
        return;
      }

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        resolve(audioBlob);
      };

      this.mediaRecorder.onerror = (error) => {
        reject(error);
      };

      if (this.mediaRecorder.state !== 'inactive') {
        this.mediaRecorder.stop();
      }
    });
  }

  pauseRecording(): void {
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.pause();
    }
  }

  resumeRecording(): void {
    if (this.mediaRecorder && this.mediaRecorder.state === 'paused') {
      this.mediaRecorder.resume();
    }
  }
}
