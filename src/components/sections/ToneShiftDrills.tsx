import React, { useState } from 'react';
import { Mic, MicOff, Check, ChevronRight, RefreshCw, Volume2 } from 'lucide-react';
import { toneDrills, ToneDrill } from '../../data/appData';
import WaveformVisualizer from '../ui/WaveformVisualizer';
import ProgressRing from '../ui/ProgressRing';

const toneDescriptions: Record<string, { color: string; description: string; tips: string }> = {
  empathetic: {
    color: '#4CAF50',
    description: 'Warm, understanding, and compassionate',
    tips: 'Lower your pitch slightly, slow your pace, and add gentle pauses',
  },
  authoritative: {
    color: '#2C5F8D',
    description: 'Confident, clear, and decisive',
    tips: 'Speak with steady pace, firm volume, and clear enunciation',
  },
  neutral: {
    color: '#6B7280',
    description: 'Balanced, professional, and objective',
    tips: 'Maintain even pitch and pace, avoid emotional inflection',
  },
};

const ToneShiftDrills: React.FC = () => {
  const [currentDrillIndex, setCurrentDrillIndex] = useState(0);
  const [currentToneIndex, setCurrentToneIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [completedTones, setCompletedTones] = useState<string[]>([]);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [showResults, setShowResults] = useState(false);

  const currentDrill = toneDrills[currentDrillIndex];
  const currentTone = currentDrill.tones[currentToneIndex];
  const toneInfo = toneDescriptions[currentTone];

  const handleStartRecording = () => {
    setIsRecording(true);
    // Simulate recording for 3 seconds
    setTimeout(() => {
      setIsRecording(false);
      // Generate random score
      const score = Math.floor(Math.random() * 30) + 70;
      setScores(prev => ({ ...prev, [currentTone]: score }));
      setCompletedTones(prev => [...prev, currentTone]);
    }, 3000);
  };

  const handleNextTone = () => {
    if (currentToneIndex < currentDrill.tones.length - 1) {
      setCurrentToneIndex(prev => prev + 1);
    } else {
      setShowResults(true);
    }
  };

  const handleNextDrill = () => {
    if (currentDrillIndex < toneDrills.length - 1) {
      setCurrentDrillIndex(prev => prev + 1);
      setCurrentToneIndex(0);
      setCompletedTones([]);
      setScores({});
      setShowResults(false);
    }
  };

  const handleRestart = () => {
    setCurrentToneIndex(0);
    setCompletedTones([]);
    setScores({});
    setShowResults(false);
  };

  const averageScore = Object.values(scores).length > 0
    ? Math.round(Object.values(scores).reduce((a, b) => a + b, 0) / Object.values(scores).length)
    : 0;

  return (
    <section className="py-16 bg-gradient-to-br from-[#2C5F8D]/5 to-[#4CAF50]/5">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1 bg-[#4CAF50]/10 text-[#4CAF50] rounded-full text-sm font-medium mb-4">
            Daily Practice
          </span>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Tone Shift Drills</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Master vocal modulation by delivering the same phrase with different emotional tones. 
            This exercise builds your ability to adapt quickly in real interpreting situations.
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {toneDrills.map((_, index) => (
            <div
              key={index}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentDrillIndex
                  ? 'bg-[#2C5F8D]'
                  : index < currentDrillIndex
                  ? 'bg-[#4CAF50]'
                  : 'bg-gray-300'
              }`}
            />
          ))}
        </div>

        {/* Main Drill Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {!showResults ? (
            <>
              {/* Phrase Display */}
              <div className="p-8 bg-gradient-to-r from-[#2C5F8D] to-[#4A90C2] text-white">
                <p className="text-sm text-white/70 mb-2">Drill {currentDrillIndex + 1} of {toneDrills.length}</p>
                <h3 className="text-xl font-semibold mb-4">"{currentDrill.phrase}"</h3>
                <p className="text-sm text-white/80">{currentDrill.context}</p>
              </div>

              {/* Tone Progress */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  {currentDrill.tones.map((tone, index) => (
                    <div key={tone} className="flex items-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                          completedTones.includes(tone)
                            ? 'bg-[#4CAF50] text-white'
                            : index === currentToneIndex
                            ? `border-2 border-[${toneDescriptions[tone].color}] text-gray-800`
                            : 'bg-gray-100 text-gray-400'
                        }`}
                        style={index === currentToneIndex && !completedTones.includes(tone) ? {
                          borderColor: toneDescriptions[tone].color
                        } : {}}
                      >
                        {completedTones.includes(tone) ? (
                          <Check className="w-5 h-5" />
                        ) : (
                          <span className="text-sm font-medium">{index + 1}</span>
                        )}
                      </div>
                      {index < currentDrill.tones.length - 1 && (
                        <div className={`w-16 h-1 mx-2 rounded ${
                          completedTones.includes(tone) ? 'bg-[#4CAF50]' : 'bg-gray-200'
                        }`} />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Current Tone Instructions */}
              <div className="p-6">
                <div
                  className="p-4 rounded-xl mb-6"
                  style={{ backgroundColor: `${toneInfo.color}15` }}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: toneInfo.color }}
                    />
                    <span className="font-semibold text-gray-800 capitalize">{currentTone} Tone</span>
                  </div>
                  <p className="text-gray-600 text-sm mb-2">{toneInfo.description}</p>
                  <p className="text-gray-500 text-xs">
                    <strong>Tip:</strong> {toneInfo.tips}
                  </p>
                </div>

                {/* Recording Area */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <WaveformVisualizer
                    isActive={isRecording}
                    height={60}
                    barCount={40}
                    color={isRecording ? toneInfo.color : '#CBD5E1'}
                  />

                  <div className="flex items-center justify-center gap-4 mt-6">
                    {!completedTones.includes(currentTone) ? (
                      <button
                        onClick={handleStartRecording}
                        disabled={isRecording}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                          isRecording
                            ? 'bg-red-500 text-white animate-pulse'
                            : 'bg-[#2C5F8D] text-white hover:bg-[#234B73]'
                        }`}
                      >
                        {isRecording ? (
                          <>
                            <MicOff className="w-5 h-5" />
                            Recording...
                          </>
                        ) : (
                          <>
                            <Mic className="w-5 h-5" />
                            Record {currentTone.charAt(0).toUpperCase() + currentTone.slice(1)} Tone
                          </>
                        )}
                      </button>
                    ) : (
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <p className="text-sm text-gray-500">Your Score</p>
                          <p className="text-3xl font-bold" style={{ color: toneInfo.color }}>
                            {scores[currentTone]}%
                          </p>
                        </div>
                        <button
                          onClick={handleNextTone}
                          className="flex items-center gap-2 px-6 py-3 bg-[#4CAF50] text-white rounded-xl font-semibold hover:bg-[#45A049] transition-colors"
                        >
                          {currentToneIndex < currentDrill.tones.length - 1 ? 'Next Tone' : 'See Results'}
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Listen to Example */}
                <button className="flex items-center gap-2 mx-auto mt-4 text-sm text-[#2C5F8D] hover:text-[#234B73] transition-colors">
                  <Volume2 className="w-4 h-4" />
                  Listen to example
                </button>
              </div>
            </>
          ) : (
            /* Results View */
            <div className="p-8 text-center">
              <ProgressRing
                progress={averageScore}
                size={140}
                strokeWidth={10}
                color={averageScore >= 80 ? '#4CAF50' : averageScore >= 60 ? '#FFA726' : '#FF6B6B'}
              >
                <div>
                  <span className="text-3xl font-bold text-gray-800">{averageScore}%</span>
                  <span className="text-xs text-gray-500 block">Average</span>
                </div>
              </ProgressRing>

              <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-2">
                {averageScore >= 80 ? 'Excellent Work!' : averageScore >= 60 ? 'Good Progress!' : 'Keep Practicing!'}
              </h3>
              <p className="text-gray-600 mb-6">
                You've completed all three tone variations for this drill.
              </p>

              {/* Individual Scores */}
              <div className="flex justify-center gap-6 mb-8">
                {currentDrill.tones.map(tone => (
                  <div key={tone} className="text-center">
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-2"
                      style={{ backgroundColor: `${toneDescriptions[tone].color}15` }}
                    >
                      <span className="text-lg font-bold" style={{ color: toneDescriptions[tone].color }}>
                        {scores[tone]}%
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 capitalize">{tone}</p>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={handleRestart}
                  className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                >
                  <RefreshCw className="w-5 h-5" />
                  Try Again
                </button>
                {currentDrillIndex < toneDrills.length - 1 && (
                  <button
                    onClick={handleNextDrill}
                    className="flex items-center gap-2 px-6 py-3 bg-[#2C5F8D] text-white rounded-xl font-semibold hover:bg-[#234B73] transition-colors"
                  >
                    Next Drill
                    <ChevronRight className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ToneShiftDrills;
