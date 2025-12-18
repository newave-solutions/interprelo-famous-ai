import React from 'react';
import { Play, Award, Clock } from 'lucide-react';
import { Expert } from '../../data/appData';

interface ExpertCardProps {
  expert: Expert;
  onPlayRecording: (expert: Expert, recordingId: string) => void;
}

const ExpertCard: React.FC<ExpertCardProps> = ({ expert, onPlayRecording }) => {
  const { name, title, specialization, yearsExperience, image, recordings } = expert;

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300">
      {/* Header */}
      <div className="relative">
        <div className="h-24 bg-gradient-to-r from-[#2C5F8D] to-[#4A90C2]" />
        <img
          src={image}
          alt={name}
          className="absolute -bottom-10 left-4 w-20 h-20 rounded-xl object-cover border-4 border-white shadow-md"
        />
      </div>

      {/* Content */}
      <div className="pt-12 p-4">
        <h3 className="font-semibold text-gray-800">{name}</h3>
        <p className="text-sm text-gray-500">{title}</p>
        
        <div className="flex items-center gap-4 mt-3 text-sm">
          <div className="flex items-center gap-1 text-[#2C5F8D]">
            <Award className="w-4 h-4" />
            <span>{specialization}</span>
          </div>
          <div className="flex items-center gap-1 text-gray-500">
            <Clock className="w-4 h-4" />
            <span>{yearsExperience} years</span>
          </div>
        </div>

        {/* Recordings */}
        <div className="mt-4 space-y-2">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Recordings</p>
          {recordings.map((recording) => (
            <button
              key={recording.id}
              onClick={() => onPlayRecording(expert, recording.id)}
              className="w-full flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-[#2C5F8D]/10 transition-colors group"
            >
              <div className="w-8 h-8 rounded-full bg-[#2C5F8D] flex items-center justify-center group-hover:bg-[#2C5F8D]/80 transition-colors">
                <Play className="w-4 h-4 text-white ml-0.5" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-gray-700">{recording.title}</p>
                <p className="text-xs text-gray-400">{recording.scenario} • {recording.duration}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExpertCard;
