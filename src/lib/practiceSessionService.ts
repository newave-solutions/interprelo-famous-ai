// Practice Session Service
// Handles saving and retrieving practice session data

import { supabase } from './supabase';
import { AudioAnalysisData } from './audioAnalysis';

export interface PracticeSessionData {
  scenarioId: string;
  scenarioType: 'medical' | 'legal' | 'business' | 'emergency';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  durationMinutes: number;
  pitchScore?: number;
  paceScore?: number;
  volumeScore?: number;
  overallScore?: number;
  targetTone?: string;
  audioRecordingUrl?: string;
  notes?: string;
}

export interface PracticeSession extends PracticeSessionData {
  id: string;
  userId: string;
  completedAt: string;
  createdAt: string;
}

export class PracticeSessionService {
  /**
   * Save a completed practice session
   */
  static async savePracticeSession(data: PracticeSessionData): Promise<{ id: string } | null> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        throw new Error('Not authenticated');
      }

      const { data: sessionData, error } = await supabase
        .from('practice_sessions')
        .insert({
          user_id: session.user.id,
          scenario_id: data.scenarioId,
          scenario_type: data.scenarioType,
          difficulty: data.difficulty,
          duration_minutes: data.durationMinutes,
          pitch_score: data.pitchScore,
          pace_score: data.paceScore,
          volume_score: data.volumeScore,
          overall_score: data.overallScore,
          target_tone: data.targetTone,
          audio_recording_url: data.audioRecordingUrl,
          notes: data.notes,
          completed_at: new Date().toISOString(),
        })
        .select('id')
        .single();

      if (error) {
        console.error('Error saving practice session:', error);
        return null;
      }

      return sessionData;
    } catch (error) {
      console.error('Save practice session error:', error);
      return null;
    }
  }

  /**
   * Get user's recent practice sessions
   */
  static async getRecentSessions(limit: number = 10): Promise<PracticeSession[]> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        return [];
      }

      const { data, error } = await supabase
        .from('practice_sessions')
        .select('*')
        .eq('user_id', session.user.id)
        .order('completed_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching sessions:', error);
        return [];
      }

      return (data || []).map(s => ({
        id: s.id,
        userId: s.user_id,
        scenarioId: s.scenario_id,
        scenarioType: s.scenario_type,
        difficulty: s.difficulty,
        durationMinutes: s.duration_minutes,
        pitchScore: s.pitch_score,
        paceScore: s.pace_score,
        volumeScore: s.volume_score,
        overallScore: s.overall_score,
        targetTone: s.target_tone,
        audioRecordingUrl: s.audio_recording_url,
        notes: s.notes,
        completedAt: s.completed_at,
        createdAt: s.created_at,
      }));
    } catch (error) {
      console.error('Get recent sessions error:', error);
      return [];
    }
  }

  /**
   * Get session statistics for a specific scenario type
   */
  static async getScenarioStats(scenarioType: string): Promise<{
    totalSessions: number;
    averageScore: number;
    totalMinutes: number;
  }> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        return { totalSessions: 0, averageScore: 0, totalMinutes: 0 };
      }

      const { data, error } = await supabase
        .from('practice_sessions')
        .select('duration_minutes, overall_score')
        .eq('user_id', session.user.id)
        .eq('scenario_type', scenarioType);

      if (error || !data) {
        return { totalSessions: 0, averageScore: 0, totalMinutes: 0 };
      }

      const totalSessions = data.length;
      const totalMinutes = data.reduce((sum, s) => sum + (s.duration_minutes || 0), 0);
      const averageScore = totalSessions > 0
        ? data.reduce((sum, s) => sum + (s.overall_score || 0), 0) / totalSessions
        : 0;

      return { totalSessions, averageScore, totalMinutes };
    } catch (error) {
      console.error('Get scenario stats error:', error);
      return { totalSessions: 0, averageScore: 0, totalMinutes: 0 };
    }
  }

  /**
   * Save audio analysis data as a practice session
   */
  static async saveAudioAnalysis(
    analysisData: AudioAnalysisData,
    speechData: { wordsPerMinute?: number } | null,
    scenarioId: string = 'vocal-practice',
    durationMinutes: number
  ): Promise<{ id: string } | null> {
    const wpm = speechData?.wordsPerMinute || 0;
    return this.savePracticeSession({
      scenarioId,
      scenarioType: 'business', // Default to business
      difficulty: 'intermediate',
      durationMinutes,
      pitchScore: analysisData.pitch ? Math.min(100, (analysisData.pitch / 300) * 100) : undefined,
      paceScore: wpm ? Math.min(100, (wpm / 160) * 100) : undefined,
      volumeScore: analysisData.volume,
      overallScore: analysisData.pitch && analysisData.volume
        ? (Math.min(100, (analysisData.pitch / 300) * 100) + analysisData.volume) / 2
        : undefined,
    });
  }
}

export default PracticeSessionService;
