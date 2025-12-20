import React, { useEffect, useState } from 'react';
import { TrendingUp, Clock, Flame, Trophy, Target, Calendar, LogIn } from 'lucide-react';
import { userProgress as defaultProgress, badges as defaultBadges } from '../../data/appData';
import ProgressRing from '../ui/ProgressRing';
import { Badge as BadgeComponent } from '../ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

interface WeeklyData {
  day: string;
  sessions: number;
  minutes: number;
  score: number;
}

const ProgressDashboard: React.FC = () => {
  const { user, progress: authProgress } = useAuth();
  const [earnedBadgeIds, setEarnedBadgeIds] = useState<string[]>([]);
  const [weeklyProgress, setWeeklyProgress] = useState<WeeklyData[]>(defaultProgress.weeklyProgress);
  const [loading, setLoading] = useState(true);

  // Use auth progress if available, otherwise use defaults
  const totalSessions = authProgress?.total_sessions ?? defaultProgress.totalSessions;
  const totalMinutes = authProgress?.total_minutes ?? defaultProgress.totalMinutes;
  const currentStreak = authProgress?.current_streak ?? defaultProgress.currentStreak;
  const longestStreak = authProgress?.longest_streak ?? defaultProgress.longestStreak;
  const averagePitchScore = authProgress?.average_pitch_score ?? defaultProgress.averagePitchScore;
  const averagePaceScore = authProgress?.average_pace_score ?? defaultProgress.averagePaceScore;
  const averageVolumeScore = authProgress?.average_volume_score ?? defaultProgress.averageVolumeScore;

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        // Fetch earned badges
        const { data: badges } = await supabase
          .from('user_badges')
          .select('badge_id')
          .eq('user_id', user.id);
        
        if (badges) {
          setEarnedBadgeIds(badges.map(b => b.badge_id));
        }

        // Fetch weekly sessions
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - 6);
        weekStart.setHours(0, 0, 0, 0);

        const { data: sessions } = await supabase
          .from('practice_sessions')
          .select('completed_at, duration_minutes, overall_score')
          .eq('user_id', user.id)
          .gte('completed_at', weekStart.toISOString());

        if (sessions) {
          const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
          const weekData: WeeklyData[] = [];
          
          for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dayName = days[date.getDay()];
            
            const daySessions = sessions.filter(s => {
              const sessionDate = new Date(s.completed_at);
              return sessionDate.toDateString() === date.toDateString();
            });

            weekData.push({
              day: dayName,
              sessions: daySessions.length,
              minutes: daySessions.reduce((sum, s) => sum + (s.duration_minutes || 0), 0),
              score: daySessions.length > 0 
                ? Math.round(daySessions.reduce((sum, s) => sum + (s.overall_score || 0), 0) / daySessions.length)
                : 0,
            });
          }
          
          setWeeklyProgress(weekData);
        }
      }
      setLoading(false);
    };

    fetchUserData();
  }, [user]);

  // Merge default badges with earned status
  const badges = defaultBadges.map(badge => ({
    ...badge,
    earned: user ? earnedBadgeIds.includes(badge.id) : badge.earned,
    earnedDate: user && earnedBadgeIds.includes(badge.id) ? new Date().toLocaleDateString() : badge.earnedDate,
  }));

  const overallScore = Math.round((averagePitchScore + averagePaceScore + averageVolumeScore) / 3);
  const earnedBadges = badges.filter(b => b.earned).length;
  const maxMinutes = Math.max(...weeklyProgress.map(d => d.minutes), 1);

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-medium mb-4">
            Your Journey
          </span>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Progress Dashboard</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {user 
              ? 'Track your improvement over time and celebrate your achievements.'
              : 'Sign in to track your progress and earn badges as you improve.'}
          </p>
        </div>

        {!user && (
          <div className="mb-8 p-6 bg-gradient-to-r from-[#2C5F8D]/5 to-[#4CAF50]/5 rounded-2xl text-center">
            <LogIn className="w-12 h-12 text-[#2C5F8D] mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Track Your Progress</h3>
            <p className="text-gray-600 mb-4">Sign in to save your practice sessions and track your improvement over time.</p>
            <p className="text-sm text-gray-500">Below is sample data showing what your dashboard could look like.</p>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-gradient-to-br from-[#2C5F8D] to-[#4A90C2] rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-xl">
                <Target className="w-6 h-6" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-300" />
            </div>
            <p className="text-3xl font-bold">{totalSessions}</p>
            <p className="text-white/80 text-sm">Total Sessions</p>
          </div>

          <div className="bg-gradient-to-br from-[#4CAF50] to-[#45A049] rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-xl">
                <Clock className="w-6 h-6" />
              </div>
              <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                +{weeklyProgress.reduce((sum, d) => sum + d.minutes, 0)} this week
              </span>
            </div>
            <p className="text-3xl font-bold">{totalMinutes}</p>
            <p className="text-white/80 text-sm">Minutes Practiced</p>
          </div>

          <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-xl">
                <Flame className="w-6 h-6" />
              </div>
              <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Best: {longestStreak}</span>
            </div>
            <p className="text-3xl font-bold">{currentStreak} days</p>
            <p className="text-white/80 text-sm">Current Streak</p>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-xl">
                <Trophy className="w-6 h-6" />
              </div>
            </div>
            <p className="text-3xl font-bold">{earnedBadges}/{badges.length}</p>
            <p className="text-white/80 text-sm">Badges Earned</p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Skill Scores */}
          <div className="bg-gray-50 rounded-2xl p-6">
            <h3 className="font-semibold text-gray-800 mb-6">Skill Scores</h3>
            
            <div className="flex justify-center mb-6">
              <ProgressRing
                progress={overallScore}
                size={160}
                strokeWidth={12}
                color={overallScore >= 80 ? '#4CAF50' : overallScore >= 60 ? '#FFA726' : '#FF6B6B'}
              >
                <div className="text-center">
                  <span className="text-4xl font-bold text-gray-800">{overallScore}</span>
                  <span className="text-sm text-gray-500 block">Overall</span>
                </div>
              </ProgressRing>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Pitch Control</span>
                  <span className="font-semibold text-gray-800">{Math.round(averagePitchScore)}%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#2C5F8D] rounded-full transition-all duration-500"
                    style={{ width: `${averagePitchScore}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Pace Management</span>
                  <span className="font-semibold text-gray-800">{Math.round(averagePaceScore)}%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#4CAF50] rounded-full transition-all duration-500"
                    style={{ width: `${averagePaceScore}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Volume Control</span>
                  <span className="font-semibold text-gray-800">{Math.round(averageVolumeScore)}%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#FF6B6B] rounded-full transition-all duration-500"
                    style={{ width: `${averageVolumeScore}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Weekly Activity */}
          <div className="bg-gray-50 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-gray-800">Weekly Activity</h3>
              <Calendar className="w-5 h-5 text-gray-400" />
            </div>

            <div className="flex items-end justify-between h-40 mb-4">
              {weeklyProgress.map((day) => (
                <div key={day.day} className="flex flex-col items-center gap-2">
                  <div
                    className={`w-8 rounded-t-lg transition-all duration-500 ${
                      day.minutes > 0 ? 'bg-[#2C5F8D]' : 'bg-gray-200'
                    }`}
                    style={{
                      height: day.minutes > 0 ? `${(day.minutes / maxMinutes) * 100}%` : '8px',
                      minHeight: '8px',
                    }}
                  />
                  <span className="text-xs text-gray-500">{day.day}</span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
              <div className="text-center">
                <p className="text-xl font-bold text-gray-800">
                  {weeklyProgress.reduce((sum, d) => sum + d.sessions, 0)}
                </p>
                <p className="text-xs text-gray-500">Sessions</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-gray-800">
                  {weeklyProgress.reduce((sum, d) => sum + d.minutes, 0)}
                </p>
                <p className="text-xs text-gray-500">Minutes</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-gray-800">
                  {weeklyProgress.filter(d => d.score > 0).length > 0
                    ? Math.round(weeklyProgress.filter(d => d.score > 0).reduce((sum, d) => sum + d.score, 0) / weeklyProgress.filter(d => d.score > 0).length)
                    : 0}%
                </p>
                <p className="text-xs text-gray-500">Avg Score</p>
              </div>
            </div>
          </div>

          {/* Badges */}
          <div className="bg-gray-50 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-gray-800">Achievements</h3>
              <span className="text-sm text-[#2C5F8D] font-medium">{earnedBadges}/{badges.length}</span>
            </div>

            <div className="grid grid-cols-4 gap-4">
              {badges.map(badge => (
                <BadgeComponent
                  key={badge.id}
                  name={badge.name}
                  description={badge.description}
                  icon={badge.icon}
                  earned={badge.earned}
                  earnedDate={badge.earnedDate}
                  size="sm"
                />
              ))}
            </div>
          </div>
        </div>

        {/* Improvement Suggestions */}
        <div className="mt-8 bg-gradient-to-r from-[#2C5F8D]/5 to-[#4CAF50]/5 rounded-2xl p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Personalized Recommendations</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-[#2C5F8D]/10 flex items-center justify-center mb-3">
                <Target className="w-5 h-5 text-[#2C5F8D]" />
              </div>
              <h4 className="font-medium text-gray-800 mb-1">Focus on Pace</h4>
              <p className="text-sm text-gray-600">
                Your pace tends to increase during complex medical terms. Try the "Slow & Steady" drill.
              </p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-[#4CAF50]/10 flex items-center justify-center mb-3">
                <Flame className="w-5 h-5 text-[#4CAF50]" />
              </div>
              <h4 className="font-medium text-gray-800 mb-1">Keep the Streak!</h4>
              <p className="text-sm text-gray-600">
                {currentStreak > 0 
                  ? `You're on a ${currentStreak}-day streak! Keep it going!`
                  : 'Start practicing daily to build your streak!'}
              </p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center mb-3">
                <Trophy className="w-5 h-5 text-amber-600" />
              </div>
              <h4 className="font-medium text-gray-800 mb-1">Unlock New Scenario</h4>
              <p className="text-sm text-gray-600">
                Complete 2 more Emergency scenarios to unlock "Labor and Delivery."
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProgressDashboard;
