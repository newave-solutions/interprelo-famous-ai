import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Play, Pause, RotateCcw, Volume2, Gauge, Music } from 'lucide-react';
import VocalMeter from '../ui/VocalMeter';
import WaveformVisualizer from '../ui/WaveformVisualizer';
import ProgressRing from '../ui/ProgressRing';

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
  const [pace, setPace] = useState(55);
  const [volume, setVolume] = useState(48);
  const [overallScore, setOverallScore] = useState(0);
  const [sessionTime, setSessionTime] = useState(0);

  // Simulate real-time vocal analysis
  useEffect(() => {
    if (isRecording && !isPaused) {
      const interval = setInterval(() => {
        setPitch(prev => Math.max(20, Math.min(80, prev + (Math.random() - 0.5) * 10)));
        setPace(prev => Math.max(25, Math.min(75, prev + (Math.random() - 0.5) * 8)));
        setVolume(prev => Math.max(30, Math.min(70, prev + (Math.random() - 0.5) * 6)));
        setSessionTime(prev => prev + 1);
      }, 500);

      return () => clearInterval(interval);
    }
  }, [isRecording, isPaused]);

  // Calculate overall score
  useEffect(() => {
    const pitchScore = pitch >= 40 && pitch <= 60 ? 100 : Math.max(0, 100 - Math.abs(50 - pitch) * 2);
    const paceScore = pace >= 40 && pace <= 60 ? 100 : Math.max(0, 100 - Math.abs(50 - pace) * 2);
    const volumeScore = volume >= 40 && volume <= 60 ? 100 : Math.max(0, 100 - Math.abs(50 - volume) * 2);
    setOverallScore(Math.round((pitchScore + paceScore + volumeScore) / 3));
  }, [pitch, pace, volume]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleReset = () => {
    setIsRecording(false);
    setIsPaused(false);
    setPitch(50);
    setPace(55);
    setVolume(48);
    setSessionTime(0);
  };

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Vocal Dashboard</h2>
          {scenario && (
            <p className="text-sm text-gray-500">{scenario.title}</p>
          )}
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm text-gray-500">Session Time</p>
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
        />
      </div>

      {/* Vocal Meters */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <VocalMeter
          label="Pitch"
          value={pitch}
          targetMin={40}
          targetMax={60}
          color="#2C5F8D"
          icon={<Music className="w-4 h-4 text-[#2C5F8D]" />}
        />
        <VocalMeter
          label="Pace"
          value={pace}
          targetMin={40}
          targetMax={60}
          color="#4CAF50"
          icon={<Gauge className="w-4 h-4 text-[#4CAF50]" />}
        />
        <VocalMeter
          label="Volume"
          value={volume}
          targetMin={40}
          targetMax={60}
          color="#FF6B6B"
          icon={<Volume2 className="w-4 h-4 text-[#FF6B6B]" />}
        />
      </div>

      {/* Overall Score & Controls */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white rounded-xl p-6">
        {/* Score Ring */}
        <div className="flex items-center gap-6">
          <ProgressRing
            progress={overallScore}
            size={100}
            strokeWidth={8}
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
              {overallScore >= 80 ? 'Excellent!' : overallScore >= 60 ? 'Good Progress' : 'Keep Practicing'}
            </p>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleReset}
            className="p-3 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors"
            title="Reset"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
          
          {isRecording && (
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="p-3 bg-amber-100 text-amber-600 rounded-xl hover:bg-amber-200 transition-colors"
              title={isPaused ? 'Resume' : 'Pause'}
            >
              {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
            </button>
          )}
          
          <button
            onClick={() => setIsRecording(!isRecording)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
              isRecording
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-[#2C5F8D] text-white hover:bg-[#234B73]'
            }`}
          >
            {isRecording ? (
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
          <strong>Tip:</strong> Keep the indicators within the green target zone for optimal tone. 
          If your pace increases, take a breath and slow down deliberately.
        </p>
      </div>
    </div>
  );
};

export default VocalDashboard;
