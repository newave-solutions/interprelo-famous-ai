import React from 'react';
import { Mic, BarChart3, Target, Users, Award, Clock, Zap, Shield, Globe } from 'lucide-react';

const features = [
  {
    icon: <BarChart3 className="w-6 h-6" />,
    title: 'Real-time Tone Analysis',
    description: 'Live visual feedback on pitch, pace, and volume as you speak. Stay within the optimal zone for professional delivery.',
    color: '#2C5F8D',
  },
  {
    icon: <Target className="w-6 h-6" />,
    title: 'AI-Powered Scenarios',
    description: 'Interactive medical encounters with AI playing doctor and patient roles. Practice realistic situations safely.',
    color: '#4CAF50',
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: 'Tone Shift Drills',
    description: 'Master vocal modulation by practicing the same phrase with empathetic, authoritative, and neutral tones.',
    color: '#FF6B6B',
  },
  {
    icon: <Award className="w-6 h-6" />,
    title: 'Post-Session Reports',
    description: 'Detailed performance analysis with scores, flagged phrases, and personalized improvement suggestions.',
    color: '#FFA726',
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: 'Expert Exemplars',
    description: 'Learn from veteran interpreters with audio recordings demonstrating ideal tone in challenging scenarios.',
    color: '#9C27B0',
  },
  {
    icon: <Clock className="w-6 h-6" />,
    title: 'Daily Warm-ups',
    description: '5-minute vocal exercises to prepare for the day. Build consistency with streak tracking and badges.',
    color: '#00BCD4',
  },
];

const stats = [
  { value: '50+', label: 'Medical Scenarios' },
  { value: '15+', label: 'Expert Recordings' },
  { value: '94%', label: 'Improvement Rate' },
  { value: '24/7', label: 'Practice Access' },
];

const FeaturesSection: React.FC = () => {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1 bg-[#2C5F8D]/10 text-[#2C5F8D] rounded-full text-sm font-medium mb-4">
            Why VoiceCoach Pro
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Everything You Need to Master
            <span className="text-[#2C5F8D]"> Vocal Delivery</span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Our comprehensive platform combines cutting-edge AI technology with proven 
            training methodologies to help medical interpreters excel in high-pressure situations.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group p-6 bg-gray-50 rounded-2xl hover:bg-white hover:shadow-xl transition-all duration-300"
            >
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                style={{ backgroundColor: `${feature.color}15` }}
              >
                <div style={{ color: feature.color }}>{feature.icon}</div>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Stats Bar */}
        <div className="bg-gradient-to-r from-[#2C5F8D] to-[#4A90C2] rounded-2xl p-8 md:p-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <p className="text-4xl md:text-5xl font-bold text-white mb-2">{stat.value}</p>
                <p className="text-white/80">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-16 text-center">
          <p className="text-sm text-gray-500 mb-6">Trusted by leading healthcare organizations</p>
          <div className="flex flex-wrap items-center justify-center gap-8">
            <div className="flex items-center gap-2 text-gray-400">
              <Shield className="w-5 h-5" />
              <span className="font-medium">HIPAA Compliant</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <Globe className="w-5 h-5" />
              <span className="font-medium">40+ Languages</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <Award className="w-5 h-5" />
              <span className="font-medium">CME Credits Available</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <Mic className="w-5 h-5" />
              <span className="font-medium">ATA Certified</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
