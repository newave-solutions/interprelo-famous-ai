import React, { useState } from 'react';
import { X, ChevronRight, ChevronLeft, User, Stethoscope, MessageSquare, Check } from 'lucide-react';
import { Scenario } from '../../data/appData';
import VocalDashboard from './VocalDashboard';
import ProgressRing from '../ui/ProgressRing';

interface PracticeSessionProps {
  scenario: Scenario;
  onClose: () => void;
  onComplete: (results: SessionResults) => void;
}

interface SessionResults {
  scenarioId: string;
  overallScore: number;
  pitchScore: number;
  paceScore: number;
  volumeScore: number;
  flaggedPhrases: string[];
}

const roleIcons: Record<string, React.ReactNode> = {
  doctor: <Stethoscope className="w-5 h-5" />,
  patient: <User className="w-5 h-5" />,
  interpreter: <MessageSquare className="w-5 h-5" />,
};

const roleColors: Record<string, string> = {
  doctor: 'bg-[#2C5F8D] text-white',
  patient: 'bg-amber-500 text-white',
  interpreter: 'bg-[#4CAF50] text-white',
};

const PracticeSession: React.FC<PracticeSessionProps> = ({ scenario, onClose, onComplete }) => {
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [completedLines, setCompletedLines] = useState<number[]>([]);
  const [lineScores, setLineScores] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [isInterpreting, setIsInterpreting] = useState(false);

  const currentLine = scenario.script[currentLineIndex];
  const progress = (completedLines.length / scenario.script.length) * 100;

  const handleLineComplete = (score: number) => {
    setLineScores(prev => ({ ...prev, [currentLineIndex]: score }));
    setCompletedLines(prev => [...prev, currentLineIndex]);
    setIsInterpreting(false);
  };

  const handleNext = () => {
    if (currentLineIndex < scenario.script.length - 1) {
      setCurrentLineIndex(prev => prev + 1);
    } else {
      setShowResults(true);
    }
  };

  const handlePrevious = () => {
    if (currentLineIndex > 0) {
      setCurrentLineIndex(prev => prev - 1);
    }
  };

  const handleFinish = () => {
    const scores = Object.values(lineScores);
    const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    
    onComplete({
      scenarioId: scenario.id,
      overallScore: avgScore,
      pitchScore: Math.round(avgScore + (Math.random() - 0.5) * 10),
      paceScore: Math.round(avgScore + (Math.random() - 0.5) * 10),
      volumeScore: Math.round(avgScore + (Math.random() - 0.5) * 10),
      flaggedPhrases: ['side effects', 'complications'],
    });
  };

  // Simulate AI playing other roles
  const simulateAIResponse = () => {
    setIsInterpreting(true);
    // Simulate recording time
    setTimeout(() => {
      const score = Math.floor(Math.random() * 25) + 75;
      handleLineComplete(score);
    }, 3000);
  };

  const averageScore = Object.values(lineScores).length > 0
    ? Math.round(Object.values(lineScores).reduce((a, b) => a + b, 0) / Object.values(lineScores).length)
    : 0;

  return (
    <div className="fixed inset-0 bg-gray-100 z-50 overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-gray-800">{scenario.title}</h2>
            <p className="text-sm text-gray-500">{scenario.category} • {scenario.difficulty}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-gray-500">Progress</p>
              <p className="font-semibold text-[#2C5F8D]">{completedLines.length}/{scenario.script.length}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="h-1 bg-gray-200">
          <div
            className="h-full bg-[#4CAF50] transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {!showResults ? (
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Script Panel */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="p-4 bg-gray-50 border-b border-gray-100">
                <h3 className="font-semibold text-gray-800">Scenario Script</h3>
                <p className="text-sm text-gray-500">Interpret each line as it appears</p>
              </div>

              <div className="p-4 space-y-4 max-h-[400px] overflow-y-auto">
                {scenario.script.map((line, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-xl transition-all ${
                      index === currentLineIndex
                        ? 'bg-[#2C5F8D]/5 border-2 border-[#2C5F8D]'
                        : completedLines.includes(index)
                        ? 'bg-green-50 border border-green-200'
                        : 'bg-gray-50 border border-gray-100 opacity-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`p-1.5 rounded-lg ${roleColors[line.role]}`}>
                        {roleIcons[line.role]}
                      </div>
                      <span className="font-medium text-gray-700 capitalize">{line.role}</span>
                      {completedLines.includes(index) && (
                        <div className="ml-auto flex items-center gap-1 text-green-600">
                          <Check className="w-4 h-4" />
                          <span className="text-sm font-medium">{lineScores[index]}%</span>
                        </div>
                      )}
                    </div>
                    <p className="text-gray-800 italic">"{line.text}"</p>
                    {line.targetTone && index === currentLineIndex && (
                      <p className="text-sm text-[#2C5F8D] mt-2">
                        Target tone: <span className="font-semibold capitalize">{line.targetTone}</span>
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {/* Navigation */}
              <div className="p-4 border-t border-gray-100 flex items-center justify-between">
                <button
                  onClick={handlePrevious}
                  disabled={currentLineIndex === 0}
                  className="flex items-center gap-1 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>
                
                {completedLines.includes(currentLineIndex) ? (
                  <button
                    onClick={handleNext}
                    className="flex items-center gap-1 px-4 py-2 bg-[#4CAF50] text-white rounded-lg hover:bg-[#45A049] transition-colors"
                  >
                    {currentLineIndex < scenario.script.length - 1 ? 'Next Line' : 'View Results'}
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={simulateAIResponse}
                    disabled={isInterpreting}
                    className="flex items-center gap-1 px-4 py-2 bg-[#2C5F8D] text-white rounded-lg hover:bg-[#234B73] disabled:opacity-50 transition-colors"
                  >
                    {isInterpreting ? 'Recording...' : 'Interpret This Line'}
                  </button>
                )}
              </div>
            </div>

            {/* Vocal Dashboard */}
            <div>
              <VocalDashboard
                scenario={{
                  title: scenario.title,
                  currentLine: currentLine.text,
                  targetTone: currentLine.targetTone || 'neutral',
                }}
              />
            </div>
          </div>
        </div>
      ) : (
        /* Results View */
        <div className="max-w-2xl mx-auto px-4 py-12">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <ProgressRing
              progress={averageScore}
              size={160}
              strokeWidth={12}
              color={averageScore >= 80 ? '#4CAF50' : averageScore >= 60 ? '#FFA726' : '#FF6B6B'}
            >
              <div>
                <span className="text-4xl font-bold text-gray-800">{averageScore}%</span>
                <span className="text-sm text-gray-500 block">Overall</span>
              </div>
            </ProgressRing>

            <h3 className="text-2xl font-bold text-gray-800 mt-6 mb-2">
              {averageScore >= 80 ? 'Excellent Performance!' : averageScore >= 60 ? 'Good Work!' : 'Keep Practicing!'}
            </h3>
            <p className="text-gray-600 mb-8">
              You've completed the "{scenario.title}" scenario.
            </p>

            {/* Score Breakdown */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              {scenario.script.map((line, index) => (
                <div key={index} className="bg-gray-50 rounded-xl p-4">
                  <div className={`w-10 h-10 rounded-full ${roleColors[line.role]} flex items-center justify-center mx-auto mb-2`}>
                    {roleIcons[line.role]}
                  </div>
                  <p className="text-2xl font-bold text-gray-800">{lineScores[index] || 0}%</p>
                  <p className="text-xs text-gray-500 capitalize">Line {index + 1}</p>
                </div>
              ))}
            </div>

            {/* Feedback */}
            <div className="bg-amber-50 rounded-xl p-4 mb-8 text-left">
              <h4 className="font-semibold text-amber-800 mb-2">Areas for Improvement</h4>
              <ul className="text-sm text-amber-700 space-y-1">
                <li>• Your pace increased when discussing "side effects"</li>
                <li>• Consider adding more pauses after complex medical terms</li>
                <li>• Volume was slightly low during empathetic sections</li>
              </ul>
            </div>

            <div className="flex items-center justify-center gap-4">
              <button
                onClick={onClose}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
              >
                Back to Library
              </button>
              <button
                onClick={handleFinish}
                className="px-6 py-3 bg-[#2C5F8D] text-white rounded-xl font-semibold hover:bg-[#234B73] transition-colors"
              >
                Save & Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PracticeSession;
