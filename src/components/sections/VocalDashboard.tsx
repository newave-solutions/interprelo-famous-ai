import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Play, Pause, RotateCcw, Volume2, Gauge, Music, Download, AlertCircle } from 'lucide-react';
import VocalMeter from '../ui/VocalMeter';
import WaveformVisualizer from '../ui/WaveformVisualizer';
import ProgressRing from '../ui/ProgressRing';
import { AudioAnalyzer, AudioRecorder, AudioAnalysisData } from '@/lib/audioAnalysis';

interface VocalDashboardProps {
  scenario?: {
    title: string;
    currentLine: string;
    targetTone: string;
  };
  onClose?: () => void;
}

const VocalDashboard: React.FC<VocalDashboardProps> = ({ scenario, onClose }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [pitch, setPitch] = useState(50);
  const [pace, setPace] = useState(0);
  const [volume, setVolume] = useState(0);
  const [overallScore, setOverallScore] = useState(0);
  const [sessionTime, setSessionTime] = useState(0);
  const [waveformData, setWaveformData] = useState<Uint8Array | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  
  const audioAnalyzerRef = useRef<AudioAnalyzer | null>(null);
  const audioRecorderRef = useRef<AudioRecorder | null>(null);
  const sessionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioAnalyzerRef.current) {
        audioAnalyzerRef.current.cleanup();
      }
      if (sessionTimerRef.current) {
        clearInterval(sessionTimerRef.current);
      }
    };
  }, []);

  // Update session time
  useEffect(() => {
    if (isRecording && !isPaused) {
      sessionTimerRef.current = setInterval(() => {
        setSessionTime(prev => prev + 1);
      }, 1000);
    } else {
      if (sessionTimerRef.current) {
        clearInterval(sessionTimerRef.current);
      }
    }

    return () => {
      if (sessionTimerRef.current) {
        clearInterval(sessionTimerRef.current);
      }
    };
  }, [isRecording, isPaused]);

  // Calculate overall score
  useEffect(() => {
    if (!isRecording) return;

    // Pitch scoring (40-60 is optimal, converted from 0-100 scale)
    const pitchScore = pitch >= 35 && pitch <= 65 ? 100 : Math.max(0, 100 - Math.abs(50 - pitch) * 1.5);
    
    // Volume scoring (30-70 is optimal for speaking)
    const volumeScore = volume >= 30 && volume <= 70 ? 100 : Math.max(0, 100 - Math.abs(50 - volume) * 1.2);
    
    // Pace scoring (120-160 WPM is optimal for clear speech)
    const paceDiff = pace < 120 ? (120 - pace) : pace > 160 ? (pace - 160) : 0;
    const paceScore = Math.max(0, 100 - paceDiff * 0.8);
    
    setOverallScore(Math.round((pitchScore + paceScore + volumeScore) / 3));
  }, [pitch, pace, volume, isRecording]);

  const handleStartRecording = async () => {
    setError(null);
    setIsInitializing(true);

    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      streamRef.current = stream;

      // Initialize audio analyzer
      const analyzer = new AudioAnalyzer();
      await analyzer.initialize();
      audioAnalyzerRef.current = analyzer;

      // Initialize audio recorder
      const recorder = new AudioRecorder();
      await recorder.startRecording(stream);
      audioRecorderRef.current = recorder;

      // Start analysis
      analyzer.startAnalysis((data: AudioAnalysisData) => {
        setPitch(data.pitch);
        setVolume(data.volume);
        
        // Get waveform data for visualization
        const waveform = analyzer.getWaveformData();
        setWaveformData(waveform);
        
        // Get speech analysis for WPM
        const speechData = analyzer.getSpeechAnalysis();
        setPace(speechData.wordsPerMinute);
      });

      setIsRecording(true);
      setIsInitializing(false);
    } catch (err) {
      console.error('Error starting recording:', err);
      setError('Failed to access microphone. Please ensure microphone permissions are granted.');
      setIsInitializing(false);
    }
  };

  const handleStopRecording = async () => {
    if (audioAnalyzerRef.current) {
      audioAnalyzerRef.current.stopAnalysis();
      audioAnalyzerRef.current.cleanup();
      audioAnalyzerRef.current = null;
    }

    if (audioRecorderRef.current) {
      try {
        const blob = await audioRecorderRef.current.stopRecording();
        setRecordedBlob(blob);
      } catch (err) {
        console.error('Error stopping recording:', err);
      }
      audioRecorderRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    setIsRecording(false);
    setIsPaused(false);
  };

  const handlePauseResume = () => {
    if (!audioAnalyzerRef.current || !audioRecorderRef.current) return;

    if (isPaused) {
      audioAnalyzerRef.current.startAnalysis((data: AudioAnalysisData) => {
        setPitch(data.pitch);
        setVolume(data.volume);
        const waveform = audioAnalyzerRef.current?.getWaveformData();
        setWaveformData(waveform || null);
        const speechData = audioAnalyzerRef.current?.getSpeechAnalysis();
        setPace(speechData?.wordsPerMinute || 0);
      });
      audioRecorderRef.current.resumeRecording();
    } else {
      audioAnalyzerRef.current.stopAnalysis();
      audioRecorderRef.current.pauseRecording();
    }

    setIsPaused(!isPaused);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleReset = () => {
    handleStopRecording();
    setPitch(50);
    setPace(0);
    setVolume(0);
    setSessionTime(0);
    setOverallScore(0);
    setRecordedBlob(null);
    setError(null);
    setWaveformData(null);
  };

  const handleDownloadRecording = () => {
    if (!recordedBlob) return;

    const url = URL.createObjectURL(recordedBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vocal-practice-${new Date().toISOString()}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePlayRecording = () => {
    if (!recordedBlob) return;

    const url = URL.createObjectURL(recordedBlob);
    const audio = new Audio(url);
    audio.play();
  };

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-4 sm:p-6 shadow-lg">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-gray-800">Vocal Dashboard</h2>
          {scenario && (
            <p className="text-xs sm:text-sm text-gray-500">{scenario.title}</p>
          )}
        </div>
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="text-right">
            <p className="text-xs sm:text-sm text-gray-500">Session Time</p>
            <p className="text-2xl font-mono font-bold text-[#2C5F8D]">{formatTime(sessionTime)}</p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <span className="sr-only">Close</span>
              ×
            </button>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-800">Microphone Error</p>
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </div>
      )}

      {/* Current Prompt */}
      {scenario && (
        <div className="bg-white rounded-xl p-4 mb-6 border-l-4 border-[#2C5F8D]">
          <p className="text-sm text-gray-500 mb-1">Interpret with <span className="font-semibold text-[#2C5F8D]">{scenario.targetTone}</span> tone:</p>
          <p className="text-lg text-gray-800 italic">"{scenario.currentLine}"</p>
        </div>
      )}

      {/* Waveform Display */}
      <div className="bg-white rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-600">Live Audio Waveform</span>
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
            isRecording && !isPaused
              ? 'bg-red-100 text-red-600'
              : 'bg-gray-100 text-gray-500'
          }`}>
            <span className={`w-2 h-2 rounded-full ${
              isRecording && !isPaused ? 'bg-red-500 animate-pulse' : 'bg-gray-400'
            }`} />
            {isRecording && !isPaused ? 'Recording' : 'Ready'}
          </div>
        </div>
        <WaveformVisualizer
          isActive={isRecording && !isPaused}
          height={80}
          barCount={60}
          color={isRecording && !isPaused ? '#2C5F8D' : '#CBD5E1'}
          waveformData={waveformData}
        />
      </div>

      {/* Vocal Meters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-6">
        <VocalMeter
          label="Pitch"
          value={pitch}
          targetMin={35}
          targetMax={65}
          color="#2C5F8D"
          icon={<Music className="w-4 h-4 text-[#2C5F8D]" />}
        />
        <VocalMeter
          label="Pace (WPM)"
          value={Math.min(100, (pace / 200) * 100)}
          targetMin={60}
          targetMax={80}
          unit=""
          color="#4CAF50"
          icon={<Gauge className="w-4 h-4 text-[#4CAF50]" />}
        />
        <VocalMeter
          label="Volume"
          value={volume}
          targetMin={30}
          targetMax={70}
          color="#FF6B6B"
          icon={<Volume2 className="w-4 h-4 text-[#FF6B6B]" />}
        />
      </div>

      {/* WPM Display */}
      {isRecording && pace > 0 && (
        <div className="bg-blue-50 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Speaking Rate</p>
              <p className="text-2xl font-bold text-[#2C5F8D]">{pace} <span className="text-lg">WPM</span></p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">Target: 120-160 WPM</p>
              <p className={`text-sm font-semibold ${pace >= 120 && pace <= 160 ? 'text-green-600' : 'text-amber-600'}`}>
                {pace < 120 ? 'Speak faster' : pace > 160 ? 'Slow down' : 'Perfect pace!'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Overall Score & Controls */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6 bg-white rounded-xl p-4 sm:p-6">
        {/* Score Ring */}
        <div className="flex items-center gap-4 sm:gap-6">
          <ProgressRing
            progress={overallScore}
            size={80}
            strokeWidth={6}
            color={overallScore >= 80 ? '#4CAF50' : overallScore >= 60 ? '#FFA726' : '#FF6B6B'}
          >
            <div className="text-center">
              <span className="text-2xl font-bold text-gray-800">{overallScore}</span>
              <span className="text-xs text-gray-500 block">Score</span>
            </div>
          </ProgressRing>
          
          <div>
            <p className="text-sm text-gray-500">Overall Performance</p>
            <p className={`text-lg font-semibold ${
              overallScore >= 80 ? 'text-green-600' : overallScore >= 60 ? 'text-amber-600' : 'text-red-600'
            }`}>
              {overallScore >= 80 ? 'Excellent!' : overallScore >= 60 ? 'Good Progress' : isRecording ? 'Keep Practicing' : 'Start Recording'}
            </p>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
          {recordedBlob && (
            <>
              <button
                onClick={handlePlayRecording}
                className="p-3 bg-blue-100 text-blue-600 rounded-xl hover:bg-blue-200 transition-colors"
                title="Play Recording"
              >
                <Play className="w-5 h-5" />
              </button>
              <button
                onClick={handleDownloadRecording}
                className="p-3 bg-green-100 text-green-600 rounded-xl hover:bg-green-200 transition-colors"
                title="Download Recording"
              >
                <Download className="w-5 h-5" />
              </button>
            </>
          )}
          
          <button
            onClick={handleReset}
            className="p-3 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors"
            title="Reset"
            disabled={isInitializing}
          >
            <RotateCcw className="w-5 h-5" />
          </button>
          
          {isRecording && (
            <button
              onClick={handlePauseResume}
              className="p-3 bg-amber-100 text-amber-600 rounded-xl hover:bg-amber-200 transition-colors"
              title={isPaused ? 'Resume' : 'Pause'}
            >
              {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
            </button>
          )}
          
          <button
            onClick={isRecording ? handleStopRecording : handleStartRecording}
            disabled={isInitializing}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
              isRecording
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-[#2C5F8D] text-white hover:bg-[#234B73]'
            } ${isInitializing ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isInitializing ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Initializing...
              </>
            ) : isRecording ? (
              <>
                <MicOff className="w-5 h-5" />
                Stop Recording
              </>
            ) : (
              <>
                <Mic className="w-5 h-5" />
                Start Recording
              </>
            )}
          </button>
        </div>
      </div>

      {/* Tips */}
      <div className="mt-4 p-4 bg-blue-50 rounded-xl">
        <p className="text-sm text-[#2C5F8D]">
          <strong>Tip:</strong> Speak clearly and naturally. Target 120-160 words per minute for optimal clarity. 
          Your microphone will capture pitch, volume, and speaking pace in real-time.
        </p>
      </div>
    </div>
  );
};

// ⚡ Performance: Memoized to prevent re-renders when parent AppLayout state changes
// This component has expensive audio processing, multiple state hooks, and effects
export default React.memo(VocalDashboard);
