import React, { useState } from 'react';
import { Menu, X, Mic, BookOpen, Trophy, Users, Settings, Bell, LogIn, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface HeaderProps {
  activeSection: string;
  onNavigate: (section: string) => void;
  onOpenSettings?: () => void;
  onOpenAuth: () => void;
  onOpenProfile: () => void;
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: <Mic className="w-4 h-4" /> },
  { id: 'scenarios', label: 'Scenarios', icon: <BookOpen className="w-4 h-4" /> },
  { id: 'drills', label: 'Drills', icon: <Trophy className="w-4 h-4" /> },
  { id: 'experts', label: 'Experts', icon: <Users className="w-4 h-4" /> },
  { id: 'progress', label: 'Progress', icon: <Trophy className="w-4 h-4" /> },
];

const Header: React.FC<HeaderProps> = ({ activeSection, onNavigate, onOpenSettings, onOpenAuth, onOpenProfile }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const { user, profile, signOut, loading } = useAuth();

  const notifications = [
    { id: 1, text: "You're 2 days away from your longest streak!", time: '2h ago' },
    { id: 2, text: "New scenario unlocked: Labor and Delivery", time: '1d ago' },
    { id: 3, text: "Weekly report is ready to view", time: '2d ago' },
  ];

  const handleSignOut = async () => {
    await signOut();
    setShowProfileMenu(false);
  };

  const getDisplayName = () => {
    if (profile?.full_name) {
      const names = profile.full_name.split(' ');
      return names[0] + (names.length > 1 ? ` ${names[1]?.[0]}.` : '');
    }
    return user?.email?.split('@')[0] || 'User';
  };

  const getInitials = () => {
    if (profile?.full_name) {
      const names = profile.full_name.split(' ');
      return (names[0]?.[0] || '') + (names[1]?.[0] || '');
    }
    return user?.email?.[0]?.toUpperCase() || 'U';
  };

  return (
    <header className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-100 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate('dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2C5F8D] to-[#4A90C2] flex items-center justify-center">
              <Mic className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-gray-800">VoiceCoach</span>
              <span className="text-[#4CAF50] font-bold">Pro</span>
              <p className="text-xs text-gray-400 -mt-1">Medical Interpreter Training</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeSection === item.id
                    ? 'bg-[#2C5F8D]/10 text-[#2C5F8D]'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {user ? (
              <>
                {/* Notifications */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowNotifications(!showNotifications);
                      setShowProfileMenu(false);
                    }}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative"
                  >
                    <Bell className="w-5 h-5 text-gray-600" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                  </button>

                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden">
                      <div className="p-4 border-b border-gray-100">
                        <h3 className="font-semibold text-gray-800">Notifications</h3>
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        {notifications.map(notif => (
                          <div key={notif.id} className="p-4 hover:bg-gray-50 border-b border-gray-50 cursor-pointer">
                            <p className="text-sm text-gray-700">{notif.text}</p>
                            <p className="text-xs text-gray-400 mt-1">{notif.time}</p>
                          </div>
                        ))}
                      </div>
                      <div className="p-3 bg-gray-50">
                        <button className="text-sm text-[#2C5F8D] font-medium hover:underline w-full text-center">
                          View all notifications
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Settings */}
                <button
                  onClick={onOpenSettings}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors hidden sm:block"
                >
                  <Settings className="w-5 h-5 text-gray-600" />
                </button>

                {/* Profile */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowProfileMenu(!showProfileMenu);
                      setShowNotifications(false);
                    }}
                    className="flex items-center gap-2 p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    {profile?.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt={profile.full_name || 'Profile'}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2C5F8D] to-[#4A90C2] flex items-center justify-center">
                        <span className="text-xs font-semibold text-white">{getInitials()}</span>
                      </div>
                    )}
                    <span className="hidden sm:block text-sm font-medium text-gray-700">{getDisplayName()}</span>
                  </button>

                  {showProfileMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden">
                      <div className="p-4 border-b border-gray-100">
                        <p className="font-semibold text-gray-800">{profile?.full_name || 'User'}</p>
                        <p className="text-sm text-gray-500 truncate">{user.email}</p>
                      </div>
                      <div className="p-2">
                        <button 
                          onClick={() => {
                            onOpenProfile();
                            setShowProfileMenu(false);
                          }}
                          className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
                        >
                          My Profile
                        </button>
                        <button 
                          onClick={() => {
                            onOpenSettings?.();
                            setShowProfileMenu(false);
                          }}
                          className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
                        >
                          Account Settings
                        </button>
                        <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
                          Subscription
                        </button>
                      </div>
                      <div className="p-2 border-t border-gray-100">
                        <button 
                          onClick={handleSignOut}
                          className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* Sign In Button for non-authenticated users */
              <button
                onClick={onOpenAuth}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-[#2C5F8D] text-white font-medium rounded-lg hover:bg-[#234B73] transition-colors"
              >
                <LogIn className="w-4 h-4" />
                <span className="hidden sm:inline">Sign In</span>
              </button>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors md:hidden"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5 text-gray-600" />
              ) : (
                <Menu className="w-5 h-5 text-gray-600" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            <nav className="space-y-1">
              {navItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg font-medium transition-colors ${
                    activeSection === item.id
                      ? 'bg-[#2C5F8D]/10 text-[#2C5F8D]'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
              
              {/* Mobile Auth Button */}
              {!user && (
                <button
                  onClick={() => {
                    onOpenAuth();
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-3 w-full px-4 py-3 rounded-lg font-medium text-[#2C5F8D] bg-[#2C5F8D]/10"
                >
                  <LogIn className="w-4 h-4" />
                  Sign In / Sign Up
                </button>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
