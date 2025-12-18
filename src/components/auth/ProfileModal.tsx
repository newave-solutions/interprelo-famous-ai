import React, { useState, useEffect } from 'react';
import { X, User, Mail, Building, Briefcase, Clock, Globe, Save, Loader2, Camera, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const languageOptions = [
  'Spanish', 'Mandarin', 'Cantonese', 'Vietnamese', 'Korean', 'Tagalog',
  'Arabic', 'Russian', 'Portuguese', 'French', 'German', 'Japanese',
  'Hindi', 'Urdu', 'Farsi', 'Polish', 'Italian', 'Haitian Creole'
];

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { user, profile, updateProfile, progress } = useAuth();
  
  const [fullName, setFullName] = useState('');
  const [organization, setOrganization] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [yearsExperience, setYearsExperience] = useState(0);
  const [languages, setLanguages] = useState<string[]>([]);
  const [loading, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setOrganization(profile.organization || '');
      setJobTitle(profile.job_title || '');
      setYearsExperience(profile.years_experience || 0);
      setLanguages(profile.languages || []);
    }
  }, [profile]);

  const handleSave = async () => {
    setError(null);
    setSuccess(null);
    setSaving(true);

    const { error } = await updateProfile({
      full_name: fullName,
      organization,
      job_title: jobTitle,
      years_experience: yearsExperience,
      languages,
    });

    if (error) {
      setError(error.message);
    } else {
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(null), 3000);
    }

    setSaving(false);
  };

  const toggleLanguage = (lang: string) => {
    setLanguages(prev => 
      prev.includes(lang) 
        ? prev.filter(l => l !== lang)
        : [...prev, lang]
    );
  };

  const getInitials = () => {
    if (fullName) {
      const names = fullName.split(' ');
      return (names[0]?.[0] || '') + (names[1]?.[0] || '');
    }
    return user?.email?.[0]?.toUpperCase() || 'U';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-800">My Profile</h2>
            <p className="text-sm text-gray-500">Manage your account information</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Messages */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 p-3 bg-green-50 text-green-700 rounded-lg">
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm">{success}</p>
            </div>
          )}

          {/* Avatar Section */}
          <div className="flex items-center gap-6">
            <div className="relative">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={fullName || 'Profile'}
                  className="w-24 h-24 rounded-full object-cover border-4 border-gray-100"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#2C5F8D] to-[#4A90C2] flex items-center justify-center border-4 border-gray-100">
                  <span className="text-2xl font-bold text-white">{getInitials()}</span>
                </div>
              )}
              <button className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                <Camera className="w-4 h-4 text-gray-600" />
              </button>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">{fullName || 'Your Name'}</h3>
              <p className="text-sm text-gray-500">{user?.email}</p>
              <p className="text-xs text-gray-400 mt-1">Member since {new Date(user?.created_at || '').toLocaleDateString()}</p>
            </div>
          </div>

          {/* Stats Summary */}
          {progress && (
            <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-xl">
              <div className="text-center">
                <p className="text-2xl font-bold text-[#2C5F8D]">{progress.total_sessions}</p>
                <p className="text-xs text-gray-500">Sessions</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-[#4CAF50]">{progress.total_minutes}</p>
                <p className="text-xs text-gray-500">Minutes</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-amber-500">{progress.current_streak}</p>
                <p className="text-xs text-gray-500">Day Streak</p>
              </div>
            </div>
          )}

          {/* Form Fields */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2C5F8D]/20 focus:border-[#2C5F8D]"
                />
              </div>
            </div>

            {/* Email (Read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed"
                />
              </div>
            </div>

            {/* Organization */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Organization</label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  placeholder="Hospital or clinic name"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2C5F8D]/20 focus:border-[#2C5F8D]"
                />
              </div>
            </div>

            {/* Job Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="e.g., Medical Interpreter"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2C5F8D]/20 focus:border-[#2C5F8D]"
                />
              </div>
            </div>

            {/* Years of Experience */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Years of Experience</label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={yearsExperience}
                  onChange={(e) => setYearsExperience(parseInt(e.target.value) || 0)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2C5F8D]/20 focus:border-[#2C5F8D]"
                />
              </div>
            </div>
          </div>

          {/* Languages */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
              <Globe className="w-4 h-4" />
              Languages You Interpret
            </label>
            <div className="flex flex-wrap gap-2">
              {languageOptions.map(lang => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => toggleLanguage(lang)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    languages.includes(lang)
                      ? 'bg-[#2C5F8D] text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>

          {/* Save Button */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              onClick={onClose}
              className="px-6 py-3 text-gray-700 font-medium rounded-xl hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-[#2C5F8D] text-white font-semibold rounded-xl hover:bg-[#234B73] transition-colors disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Save className="w-5 h-5" />
              )}
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
