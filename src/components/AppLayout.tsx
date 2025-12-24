import React, { useState, useRef, useEffect } from 'react';
import Header from './layout/Header';
import Footer from './layout/Footer';
import HeroSection from './sections/HeroSection';
import FeaturesSection from './sections/FeaturesSection';
import VocalDashboard from './sections/VocalDashboard';
import ScenarioLibrary from './sections/ScenarioLibrary';
import ExpertLibrary from './sections/ExpertLibrary';
import ToneShiftDrills from './sections/ToneShiftDrills';
import ProgressDashboard from './sections/ProgressDashboard';
import DailyWarmup from './sections/DailyWarmup';
import BaselineAssessment from './sections/BaselineAssessment';
import PracticeSession from './sections/PracticeSession';
import AuthModal from './auth/AuthModal';
import ProfileModal from './auth/ProfileModal';
import { Scenario } from '../data/appData';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

const AppLayout: React.FC = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [showBaseline, setShowBaseline] = useState(false);
  const [showPractice, setShowPractice] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [hasCompletedBaseline, setHasCompletedBaseline] = useState(false);

  const { user, loading: _loading, refreshProgress } = useAuth();

  // Refs for scrolling
  const dashboardRef = useRef<HTMLDivElement>(null);
  const scenariosRef = useRef<HTMLDivElement>(null);
  const drillsRef = useRef<HTMLDivElement>(null);
  const expertsRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  // Check if user has completed baseline assessment
  useEffect(() => {
    const checkBaseline = async () => {
      if (user) {
        const { data } = await supabase
          .from('baseline_assessments')
          .select('id')
          .eq('user_id', user.id)
          .limit(1);
        
        setHasCompletedBaseline(data && data.length > 0);
      }
    };
    checkBaseline();
  }, [user]);

  const handleNavigate = (section: string) => {
    setActiveSection(section);
    
    const refs: Record<string, React.RefObject<HTMLDivElement>> = {
      dashboard: dashboardRef,
      scenarios: scenariosRef,
      drills: drillsRef,
      experts: expertsRef,
      progress: progressRef,
    };

    refs[section]?.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleStartPractice = () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    
    if (!hasCompletedBaseline) {
      setShowBaseline(true);
    } else {
      handleNavigate('scenarios');
    }
  };

  const handleTakeBaseline = () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    setShowBaseline(true);
  };

  const handleBaselineComplete = async (results: { naturalPitch: number; naturalPace: number; naturalVolume: number; toneRange: number }) => {
    if (user) {
      // Save baseline to database
      await supabase.from('baseline_assessments').insert({
        user_id: user.id,
        natural_pitch: results.naturalPitch,
        natural_pace: results.naturalPace,
        natural_volume: results.naturalVolume,
        tone_range: results.toneRange,
      });
      
      setHasCompletedBaseline(true);
    }
    setShowBaseline(false);
  };

  const handleSelectScenario = (scenario: Scenario) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    setSelectedScenario(scenario);
    setShowPractice(true);
  };

  const handlePracticeComplete = async (results: {
    scenarioId: string;
    overallScore: number;
    pitchScore: number;
    paceScore: number;
    volumeScore: number;
    flaggedPhrases: string[];
  }) => {
    if (user && selectedScenario) {
      // Save practice session to database
      await supabase.from('practice_sessions').insert({
        user_id: user.id,
        scenario_id: results.scenarioId,
        scenario_title: selectedScenario.title,
        duration_minutes: parseInt(selectedScenario.duration) || 10,
        overall_score: results.overallScore,
        pitch_score: results.pitchScore,
        pace_score: results.paceScore,
        volume_score: results.volumeScore,
        flagged_phrases: results.flaggedPhrases,
      });

      // Update user progress
      const { data: currentProgress } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (currentProgress) {
        const today = new Date().toISOString().split('T')[0];
        const lastPractice = currentProgress.last_practice_date;
        const isConsecutiveDay = lastPractice && 
          new Date(today).getTime() - new Date(lastPractice).getTime() <= 86400000;
        
        const newStreak = isConsecutiveDay ? currentProgress.current_streak + 1 : 1;
        const totalSessions = currentProgress.total_sessions + 1;
        
        // Calculate new averages
        const newPitchAvg = ((currentProgress.average_pitch_score * currentProgress.total_sessions) + results.pitchScore) / totalSessions;
        const newPaceAvg = ((currentProgress.average_pace_score * currentProgress.total_sessions) + results.paceScore) / totalSessions;
        const newVolumeAvg = ((currentProgress.average_volume_score * currentProgress.total_sessions) + results.volumeScore) / totalSessions;

        await supabase
          .from('user_progress')
          .update({
            total_sessions: totalSessions,
            total_minutes: currentProgress.total_minutes + (parseInt(selectedScenario.duration) || 10),
            current_streak: newStreak,
            longest_streak: Math.max(newStreak, currentProgress.longest_streak),
            last_practice_date: today,
            average_pitch_score: newPitchAvg,
            average_pace_score: newPaceAvg,
            average_volume_score: newVolumeAvg,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', user.id);

        // Check for badges
        await checkAndAwardBadges(user.id, totalSessions, newStreak);
      }

      // Refresh progress data
      await refreshProgress();
    }

    setShowPractice(false);
    setSelectedScenario(null);
    handleNavigate('progress');
  };

  const checkAndAwardBadges = async (userId: string, totalSessions: number, streak: number) => {
    const badgesToCheck = [
      { id: '1', name: 'First Steps', condition: totalSessions >= 1 },
      { id: '2', name: 'Week Warrior', condition: streak >= 7 },
      { id: '8', name: 'Scenario Scholar', condition: totalSessions >= 10 },
    ];

    for (const badge of badgesToCheck) {
      if (badge.condition) {
        // Try to insert badge (will fail silently if already exists due to unique constraint)
        await supabase.from('user_badges').insert({
          user_id: userId,
          badge_id: badge.id,
          badge_name: badge.name,
        }).select();
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header 
        activeSection={activeSection} 
        onNavigate={handleNavigate}
        onOpenAuth={() => setShowAuthModal(true)}
        onOpenProfile={() => setShowProfileModal(true)}
      />

      {/* Hero Section */}
      <HeroSection onStartPractice={handleStartPractice} onTakeBaseline={handleTakeBaseline} />

      {/* Features Section */}
      <FeaturesSection />

      {/* Dashboard Section */}
      <section ref={dashboardRef} className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1 bg-[#2C5F8D]/10 text-[#2C5F8D] rounded-full text-sm font-medium mb-4">
              Practice Mode
            </span>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Vocal Dashboard</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Get real-time feedback on your vocal delivery. The dashboard monitors your pitch, 
              pace, and volume to help you maintain optimal tone during interpretation.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Dashboard */}
            <div className="lg:col-span-2">
              <VocalDashboard
                scenario={{
                  title: 'Demo Mode',
                  currentLine: 'The test results show some abnormalities that we need to discuss.',
                  targetTone: 'empathetic',
                }}
              />
            </div>

            {/* Daily Warmup */}
            <div>
              <DailyWarmup />
            </div>
          </div>
        </div>
      </section>

      {/* Scenarios Section */}
      <div ref={scenariosRef}>
        <ScenarioLibrary onSelectScenario={handleSelectScenario} />
      </div>

      {/* Tone Shift Drills Section */}
      <div ref={drillsRef}>
        <ToneShiftDrills />
      </div>

      {/* Expert Library Section */}
      <div ref={expertsRef}>
        <ExpertLibrary />
      </div>

      {/* Progress Dashboard Section */}
      <div ref={progressRef}>
        <ProgressDashboard />
      </div>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#2C5F8D] to-[#4A90C2]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Transform Your Vocal Delivery?
          </h2>
          <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of medical interpreters who have improved their communication 
            skills with VoiceCoach Pro. Start your free trial today.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={user ? handleStartPractice : () => setShowAuthModal(true)}
              className="px-8 py-4 bg-white text-[#2C5F8D] font-semibold rounded-xl hover:bg-gray-100 transition-colors shadow-lg"
            >
              {user ? 'Start Practice Session' : 'Start Free Trial'}
            </button>
            <button className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-xl border border-white/20 hover:bg-white/20 transition-colors">
              Schedule Demo
            </button>
          </div>
          <p className="text-white/60 text-sm mt-6">
            No credit card required • 14-day free trial • Cancel anytime
          </p>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">What Interpreters Say</h2>
            <p className="text-gray-600">Hear from professionals who've transformed their practice</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                quote: "VoiceCoach Pro helped me maintain composure during a difficult pediatric emergency. The tone drills were invaluable.",
                author: "Maria G.",
                role: "Hospital Interpreter, 8 years",
                rating: 5,
              },
              {
                quote: "The real-time feedback changed how I think about my voice. I never realized how much my pace increased under stress.",
                author: "James L.",
                role: "Freelance Medical Interpreter",
                rating: 5,
              },
              {
                quote: "The expert recordings are gold. Learning from veterans has accelerated my growth more than any course I've taken.",
                author: "Fatima A.",
                role: "Clinic Interpreter, 3 years",
                rating: 5,
              },
            ].map((testimonial, index) => (
              <div key={index} className="bg-gray-50 rounded-2xl p-6">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-amber-400 fill-current" viewBox="0 0 20 20">
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">"{testimonial.quote}"</p>
                <div>
                  <p className="font-semibold text-gray-800">{testimonial.author}</p>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />

      {/* Modals */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />

      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />

      {showBaseline && (
        <BaselineAssessment
          onComplete={handleBaselineComplete}
          onClose={() => setShowBaseline(false)}
        />
      )}

      {showPractice && selectedScenario && (
        <PracticeSession
          scenario={selectedScenario}
          onClose={() => {
            setShowPractice(false);
            setSelectedScenario(null);
          }}
          onComplete={handlePracticeComplete}
        />
      )}
    </div>
  );
};

export default AppLayout;
