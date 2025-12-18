import React from 'react';
import { Play, ArrowRight, Mic, BarChart3, Target } from 'lucide-react';
import WaveformVisualizer from '../ui/WaveformVisualizer';
import { IMAGES } from '../../data/appData';

interface HeroSectionProps {
  onStartPractice: () => void;
  onTakeBaseline: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ onStartPractice, onTakeBaseline }) => {
  return (
    <section className="relative min-h-[90vh] bg-gradient-to-br from-[#1A1A2E] via-[#16213E] to-[#0F3460] overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
          backgroundSize: '40px 40px',
        }} />
      </div>

      {/* Animated Waveform Background */}
      <div className="absolute bottom-0 left-0 right-0 opacity-20">
        <WaveformVisualizer height={200} barCount={80} color="#4A90C2" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-white space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-sm text-white/80">AI-Powered Voice Training</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
              Master Your Voice.
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#4A90C2] to-[#6BB5E0]">
                Transform Your Impact.
              </span>
            </h1>

            <p className="text-lg text-white/70 max-w-xl">
              The professional voice coaching platform for medical interpreters. 
              Get real-time AI feedback, practice with realistic scenarios, and 
              develop the calm, authoritative tone that saves lives.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={onStartPractice}
                className="group flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-[#4CAF50] to-[#45A049] text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-green-500/30 transition-all duration-300"
              >
                <Play className="w-5 h-5" />
                Start Practice Session
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button
                onClick={onTakeBaseline}
                className="flex items-center justify-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-300"
              >
                <Mic className="w-5 h-5" />
                Take Baseline Test
              </button>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-8 pt-8 border-t border-white/10">
              <div>
                <p className="text-3xl font-bold text-white">10,000+</p>
                <p className="text-sm text-white/60">Interpreters Trained</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-white">50+</p>
                <p className="text-sm text-white/60">Medical Scenarios</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-white">94%</p>
                <p className="text-sm text-white/60">Improvement Rate</p>
              </div>
            </div>
          </div>

          {/* Right Content - Hero Image with Overlay */}
          <div className="relative hidden lg:block">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img
                src={IMAGES.hero}
                alt="Medical interpreter practicing with voice coach"
                className="w-full h-[500px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A2E]/80 via-transparent to-transparent" />
              
              {/* Floating Cards */}
              <div className="absolute bottom-6 left-6 right-6 space-y-3">
                {/* Live Feedback Card */}
                <div className="bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-[#2C5F8D]/10 flex items-center justify-center">
                      <BarChart3 className="w-5 h-5 text-[#2C5F8D]" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">Live Vocal Analysis</p>
                      <p className="text-xs text-gray-500">Real-time feedback</p>
                    </div>
                  </div>
                  <WaveformVisualizer height={40} barCount={30} color="#2C5F8D" />
                </div>

                {/* Score Card */}
                <div className="flex gap-3">
                  <div className="flex-1 bg-white/95 backdrop-blur-sm rounded-xl p-3 shadow-lg">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-gray-600">Tone Score</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-800 mt-1">92%</p>
                  </div>
                  <div className="flex-1 bg-white/95 backdrop-blur-sm rounded-xl p-3 shadow-lg">
                    <div className="flex items-center gap-2">
                      <Mic className="w-4 h-4 text-[#2C5F8D]" />
                      <span className="text-sm text-gray-600">Pace</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-800 mt-1">Optimal</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/50">
        <span className="text-sm">Scroll to explore</span>
        <div className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-2">
          <div className="w-1.5 h-3 bg-white/50 rounded-full animate-bounce" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
