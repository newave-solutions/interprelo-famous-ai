import React, { useState } from 'react';
import { Play, Pause, X, Volume2 } from 'lucide-react';
import ExpertCard from '../cards/ExpertCard';
import { experts, Expert, ExpertRecording } from '../../data/appData';
import WaveformVisualizer from '../ui/WaveformVisualizer';

const ExpertLibrary: React.FC = () => {
  const [selectedRecording, setSelectedRecording] = useState<{
    expert: Expert;
    recording: ExpertRecording;
  } | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const handlePlayRecording = (expert: Expert, recordingId: string) => {
    const recording = expert.recordings.find(r => r.id === recordingId);
    if (recording) {
      setSelectedRecording({ expert, recording });
      setIsPlaying(true);
      setProgress(0);
    }
  };

  const handleClosePlayer = () => {
    setSelectedRecording(null);
    setIsPlaying(false);
    setProgress(0);
  };

  // Simulate playback progress
  React.useEffect(() => {
    if (isPlaying && selectedRecording) {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            setIsPlaying(false);
            return 100;
          }
          return prev + 1;
        });
      }, 100);
      return () => clearInterval(interval);
    }
  }, [isPlaying, selectedRecording]);

  return (
    <section className="py-12 sm:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <span className="inline-block px-4 py-1 bg-[#2C5F8D]/10 text-[#2C5F8D] rounded-full text-sm font-medium mb-4">
            Learn from the Best
          </span>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Expert Exemplars</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Listen to recordings from veteran medical interpreters demonstrating ideal tone 
            in various challenging scenarios. Study their techniques and apply them to your practice.
          </p>
        </div>

        {/* Expert Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {experts.map(expert => (
            <ExpertCard
              key={expert.id}
              expert={expert}
              onPlayRecording={handlePlayRecording}
            />
          ))}
        </div>

        {/* Audio Player Modal */}
        {selectedRecording && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden">
              {/* Player Header */}
              <div className="bg-gradient-to-r from-[#2C5F8D] to-[#4A90C2] p-6 text-white">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <img
                      src={selectedRecording.expert.image}
                      alt={selectedRecording.expert.name}
                      className="w-16 h-16 rounded-xl object-cover border-2 border-white/30"
                    />
                    <div>
                      <h3 className="font-semibold text-lg">{selectedRecording.recording.title}</h3>
                      <p className="text-white/80 text-sm">{selectedRecording.expert.name}</p>
                      <p className="text-white/60 text-xs">{selectedRecording.recording.scenario}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleClosePlayer}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Waveform */}
              <div className="p-6 bg-gray-50">
                <WaveformVisualizer
                  isActive={isPlaying}
                  height={60}
                  barCount={50}
                  color="#2C5F8D"
                />
                
                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#2C5F8D] transition-all duration-100"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-1 text-xs text-gray-500">
                    <span>{Math.floor(progress * 0.01 * parseFloat(selectedRecording.recording.duration.replace(':', '.')) * 60)}s</span>
                    <span>{selectedRecording.recording.duration}</span>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-center gap-4 mt-6">
                  <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                    <Volume2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="w-14 h-14 rounded-full bg-[#2C5F8D] text-white flex items-center justify-center hover:bg-[#234B73] transition-colors shadow-lg"
                  >
                    {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
                  </button>
                  <button
                    onClick={() => setProgress(0)}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 4v6h6M23 20v-6h-6" />
                      <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Transcript */}
              <div className="p-6 border-t border-gray-100">
                <h4 className="font-semibold text-gray-800 mb-2">Expert Commentary</h4>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {selectedRecording.recording.transcript}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

// ⚡ Performance: Memoized to prevent re-renders when parent state changes
// This component renders expert cards with media player and audio visualization
export default React.memo(ExpertLibrary);
