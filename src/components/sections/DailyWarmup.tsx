import React, { useState, useEffect } from 'react';
import { Play, Pause, SkipForward, RotateCcw, Check, Sun, Coffee, Mic } from 'lucide-react';
import WaveformVisualizer from '../ui/WaveformVisualizer';
import ProgressRing from '../ui/ProgressRing';

interface WarmupExercise {
  id: string;
  title: string;
  instruction: string;
  duration: number; // in seconds
  type: 'breathing' | 'articulation' | 'tone';
}

const warmupExercises: WarmupExercise[] = [
  {
    id: '1',
    title: 'Deep Breathing',
    instruction: 'Inhale slowly for 4 counts, hold for 4 counts, exhale for 6 counts. Repeat 3 times.',
    duration: 45,
    type: 'breathing',
  },
  {
    id: '2',
    title: 'Lip Trills',
    instruction: 'Relax your lips and blow air through them, creating a "brrr" sound. Vary the pitch up and down.',
    duration: 30,
    type: 'articulation',
  },
  {
    id: '3',
    title: 'Tongue Twisters',
    instruction: 'Say "The sixth sick sheikh\'s sixth sheep\'s sick" slowly, then gradually increase speed.',
    duration: 45,
    type: 'articulation',
  },
  {
    id: '4',
    title: 'Pitch Glides',
    instruction: 'Start at your lowest comfortable pitch and slide smoothly to your highest, then back down.',
    duration: 30,
    type: 'tone',
  },
  {
    id: '5',
    title: 'Empathetic Phrase',
    instruction: 'Say "I understand this must be very difficult for you" with genuine warmth and compassion.',
    duration: 30,
    type: 'tone',
  },
  {
    id: '6',
    title: 'Authoritative Phrase',
    instruction: 'Say "You must take this medication exactly as prescribed" with confident clarity.',
    duration: 30,
    type: 'tone',
  },
];

const DailyWarmup: React.FC = () => {
  const [currentExercise, setCurrentExercise] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(warmupExercises[0].duration);
  const [completedExercises, setCompletedExercises] = useState<string[]>([]);
  const [showCompletion, setShowCompletion] = useState(false);

  const exercise = warmupExercises[currentExercise];
  const totalDuration = warmupExercises.reduce((sum, ex) => sum + ex.duration, 0);
  const completedDuration = warmupExercises
    .filter(ex => completedExercises.includes(ex.id))
    .reduce((sum, ex) => sum + ex.duration, 0);
  const overallProgress = (completedDuration / totalDuration) * 100;

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
    } else if (timeRemaining === 0 && isActive) {
      handleExerciseComplete();
    }

    return () => clearInterval(interval);
  }, [isActive, timeRemaining]);

  const handleExerciseComplete = () => {
    setIsActive(false);
    setCompletedExercises(prev => [...prev, exercise.id]);
    
    if (currentExercise < warmupExercises.length - 1) {
      setCurrentExercise(prev => prev + 1);
      setTimeRemaining(warmupExercises[currentExercise + 1].duration);
    } else {
      setShowCompletion(true);
    }
  };

  const handleSkip = () => {
    handleExerciseComplete();
  };

  const handleReset = () => {
    setCurrentExercise(0);
    setTimeRemaining(warmupExercises[0].duration);
    setCompletedExercises([]);
    setIsActive(false);
    setShowCompletion(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const typeColors = {
    breathing: '#4CAF50',
    articulation: '#2C5F8D',
    tone: '#FF6B6B',
  };

  const typeIcons = {
    breathing: <Sun className="w-5 h-5" />,
    articulation: <Coffee className="w-5 h-5" />,
    tone: <Mic className="w-5 h-5" />,
  };

  if (showCompletion) {
    return (
      <div className="bg-gradient-to-br from-[#4CAF50]/10 to-[#2C5F8D]/10 rounded-2xl p-8 text-center">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
          <Check className="w-10 h-10 text-green-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-800 mb-2">Warm-up Complete!</h3>
        <p className="text-gray-600 mb-6">
          Great job! You've completed your daily vocal warm-up. You're ready to practice!
        </p>
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
          >
            <RotateCcw className="w-5 h-5" />
            Do Again
          </button>
          <button className="px-6 py-3 bg-[#2C5F8D] text-white rounded-xl font-semibold hover:bg-[#234B73] transition-colors">
            Start Practice Session
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sun className="w-5 h-5" />
              <span className="text-sm font-medium text-white/80">Daily Warm-up</span>
            </div>
            <h3 className="text-xl font-bold">5-Minute Vocal Preparation</h3>
          </div>
          <ProgressRing progress={overallProgress} size={70} strokeWidth={6} color="#fff">
            <span className="text-sm font-bold">{Math.round(overallProgress)}%</span>
          </ProgressRing>
        </div>
      </div>

      {/* Exercise Progress */}
      <div className="p-4 bg-gray-50 border-b border-gray-100">
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {warmupExercises.map((ex, index) => (
            <div
              key={ex.id}
              className={`flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                index === currentExercise
                  ? 'bg-white shadow-sm border border-gray-200'
                  : completedExercises.includes(ex.id)
                  ? 'bg-green-100'
                  : 'bg-gray-100'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                  completedExercises.includes(ex.id)
                    ? 'bg-green-500 text-white'
                    : index === currentExercise
                    ? 'bg-[#2C5F8D] text-white'
                    : 'bg-gray-300 text-gray-600'
                }`}
              >
                {completedExercises.includes(ex.id) ? <Check className="w-3 h-3" /> : index + 1}
              </div>
              <span className={`text-sm ${index === currentExercise ? 'font-medium' : 'text-gray-500'}`}>
                {ex.title}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Current Exercise */}
      <div className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div
            className="p-2 rounded-lg"
            style={{ backgroundColor: `${typeColors[exercise.type]}15` }}
          >
            <div style={{ color: typeColors[exercise.type] }}>{typeIcons[exercise.type]}</div>
          </div>
          <div>
            <h4 className="font-semibold text-gray-800">{exercise.title}</h4>
            <span
              className="text-xs font-medium px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: `${typeColors[exercise.type]}15`,
                color: typeColors[exercise.type],
              }}
            >
              {exercise.type.charAt(0).toUpperCase() + exercise.type.slice(1)}
            </span>
          </div>
        </div>

        <p className="text-gray-600 mb-6 p-4 bg-gray-50 rounded-xl">{exercise.instruction}</p>

        {/* Timer & Waveform */}
        <div className="bg-gray-50 rounded-xl p-6 mb-6">
          <div className="text-center mb-4">
            <span className="text-4xl font-mono font-bold text-gray-800">
              {formatTime(timeRemaining)}
            </span>
            <p className="text-sm text-gray-500 mt-1">
              {isActive ? 'Time remaining' : 'Press play to start'}
            </p>
          </div>

          <WaveformVisualizer
            isActive={isActive}
            height={50}
            barCount={40}
            color={isActive ? typeColors[exercise.type] : '#CBD5E1'}
          />

          {/* Progress Bar */}
          <div className="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full transition-all duration-1000"
              style={{
                width: `${((exercise.duration - timeRemaining) / exercise.duration) * 100}%`,
                backgroundColor: typeColors[exercise.type],
              }}
            />
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={handleReset}
            className="p-3 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors"
            title="Reset"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            onClick={() => setIsActive(!isActive)}
            className="w-16 h-16 rounded-full bg-[#2C5F8D] text-white flex items-center justify-center hover:bg-[#234B73] transition-colors shadow-lg"
          >
            {isActive ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 ml-1" />}
          </button>

          <button
            onClick={handleSkip}
            className="p-3 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors"
            title="Skip"
          >
            <SkipForward className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DailyWarmup;
