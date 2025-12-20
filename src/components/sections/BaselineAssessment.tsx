import React, { useState } from 'react';
import { Mic, MicOff, ChevronRight, Check, X, Volume2 } from 'lucide-react';
import { baselinePrompts } from '../../data/appData';
import WaveformVisualizer from '../ui/WaveformVisualizer';
import ProgressRing from '../ui/ProgressRing';

interface BaselineAssessmentProps {
  onComplete: (results: BaselineResults) => void;
  onClose: () => void;
}

interface BaselineResults {
  naturalPitch: number;
  naturalPace: number;
  naturalVolume: number;
  toneRange: number;
}

const BaselineAssessment: React.FC<BaselineAssessmentProps> = ({ onComplete, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [completedPrompts, setCompletedPrompts] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);

  const currentPrompt = baselinePrompts[currentStep];
  const progress = (completedPrompts.length / baselinePrompts.length) * 100;

  const handleStartRecording = () => {
    setIsRecording(true);
    // Simulate recording for 4 seconds
    setTimeout(() => {
      setIsRecording(false);
      setCompletedPrompts(prev => [...prev, currentStep]);
    }, 4000);
  };

  const handleNext = () => {
    if (currentStep < baselinePrompts.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      setShowResults(true);
    }
  };

  const handleComplete = () => {
    onComplete({
      naturalPitch: 52,
      naturalPace: 48,
      naturalVolume: 55,
      toneRange: 78,
    });
  };

  const typeColors: Record<string, string> = {
    neutral: '#6B7280',
    empathetic: '#4CAF50',
    authoritative: '#2C5F8D',
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 p-4 sm:p-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Baseline Assessment</h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">Establish your natural vocal profile</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {!showResults ? (
          <>
            {/* Progress Bar */}
            <div className="px-6 py-4 bg-gray-50">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-600">Progress</span>
                <span className="font-medium text-gray-800">{completedPrompts.length}/{baselinePrompts.length}</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#2C5F8D] transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Current Prompt */}
            <div className="p-6">
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <span
                    className="px-3 py-1 rounded-full text-xs font-medium text-white"
                    style={{ backgroundColor: typeColors[currentPrompt.type] }}
                  >
                    {currentPrompt.type.charAt(0).toUpperCase() + currentPrompt.type.slice(1)}
                  </span>
                  <span className="text-sm text-gray-500">Prompt {currentStep + 1}</span>
                </div>
                <p className="text-lg text-gray-800">{currentPrompt.text}</p>
              </div>

              {/* Recording Area */}
              <div className="bg-gray-50 rounded-xl p-6 mb-6">
                <WaveformVisualizer
                  isActive={isRecording}
                  height={80}
                  barCount={50}
                  color={isRecording ? '#2C5F8D' : '#CBD5E1'}
                />

                <div className="flex items-center justify-center mt-6">
                  {!completedPrompts.includes(currentStep) ? (
                    <button
                      onClick={handleStartRecording}
                      disabled={isRecording}
                      className={`flex items-center gap-2 px-8 py-4 rounded-xl font-semibold transition-all ${
                        isRecording
                          ? 'bg-red-500 text-white animate-pulse'
                          : 'bg-[#2C5F8D] text-white hover:bg-[#234B73]'
                      }`}
                    >
                      {isRecording ? (
                        <>
                          <MicOff className="w-5 h-5" />
                          Recording... Speak Now
                        </>
                      ) : (
                        <>
                          <Mic className="w-5 h-5" />
                          Start Recording
                        </>
                      )}
                    </button>
                  ) : (
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 text-green-600">
                        <Check className="w-5 h-5" />
                        <span className="font-medium">Recording Complete</span>
                      </div>
                      <button
                        onClick={handleNext}
                        className="flex items-center gap-2 px-6 py-3 bg-[#4CAF50] text-white rounded-xl font-semibold hover:bg-[#45A049] transition-colors"
                      >
                        {currentStep < baselinePrompts.length - 1 ? 'Next Prompt' : 'View Results'}
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Tips */}
              <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl">
                <Volume2 className="w-5 h-5 text-[#2C5F8D] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-[#2C5F8D] font-medium">Recording Tips</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Speak naturally as you would in a professional setting. 
                    Ensure you're in a quiet environment for accurate analysis.
                  </p>
                </div>
              </div>
            </div>

            {/* Prompt Navigation */}
            <div className="px-6 pb-6">
              <div className="flex items-center justify-center gap-2">
                {baselinePrompts.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => completedPrompts.includes(index) && setCurrentStep(index)}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      index === currentStep
                        ? 'bg-[#2C5F8D]'
                        : completedPrompts.includes(index)
                        ? 'bg-[#4CAF50]'
                        : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
          </>
        ) : (
          /* Results View */
          <div className="p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-green-600" />
            </div>

            <h3 className="text-2xl font-bold text-gray-800 mb-2">Assessment Complete!</h3>
            <p className="text-gray-600 mb-8">
              We've analyzed your vocal patterns and created your personalized baseline profile.
            </p>

            {/* Results Grid */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-gray-50 rounded-xl p-4">
                <ProgressRing progress={52} size={80} strokeWidth={6} color="#2C5F8D">
                  <span className="text-lg font-bold text-gray-800">52</span>
                </ProgressRing>
                <p className="text-sm text-gray-600 mt-2">Natural Pitch</p>
                <p className="text-xs text-gray-400">Mid-range, balanced</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <ProgressRing progress={48} size={80} strokeWidth={6} color="#4CAF50">
                  <span className="text-lg font-bold text-gray-800">48</span>
                </ProgressRing>
                <p className="text-sm text-gray-600 mt-2">Natural Pace</p>
                <p className="text-xs text-gray-400">Moderate, clear</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <ProgressRing progress={55} size={80} strokeWidth={6} color="#FF6B6B">
                  <span className="text-lg font-bold text-gray-800">55</span>
                </ProgressRing>
                <p className="text-sm text-gray-600 mt-2">Natural Volume</p>
                <p className="text-xs text-gray-400">Confident projection</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <ProgressRing progress={78} size={80} strokeWidth={6} color="#FFA726">
                  <span className="text-lg font-bold text-gray-800">78</span>
                </ProgressRing>
                <p className="text-sm text-gray-600 mt-2">Tone Range</p>
                <p className="text-xs text-gray-400">Good flexibility</p>
              </div>
            </div>

            <button
              onClick={handleComplete}
              className="px-8 py-4 bg-[#2C5F8D] text-white rounded-xl font-semibold hover:bg-[#234B73] transition-colors"
            >
              Start Your Training Journey
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BaselineAssessment;
