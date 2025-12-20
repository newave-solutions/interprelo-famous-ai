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
      <div className="pt-12 px-3 sm:px-4 pb-3 sm:pb-4">
        <h3 className="text-sm sm:text-base font-semibold text-gray-800">{name}</h3>
        <p className="text-xs sm:text-sm text-gray-500">{title}</p>
        
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-3 text-xs sm:text-sm">
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
        <div className="mt-3 sm:mt-4 space-y-1.5 sm:space-y-2">
          <p className="text-[10px] sm:text-xs font-medium text-gray-400 uppercase tracking-wide">Recordings</p>
          {recordings.map((recording) => (
            <button
              key={recording.id}
              onClick={() => onPlayRecording(expert, recording.id)}
              className="w-full flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-gray-50 rounded-lg hover:bg-[#2C5F8D]/10 transition-colors group"
            >
              <div className="w-7 sm:w-8 h-7 sm:h-8 flex-shrink-0 rounded-full bg-[#2C5F8D] flex items-center justify-center group-hover:bg-[#2C5F8D]/80 transition-colors">
                <Play className="w-3 sm:w-4 h-3 sm:h-4 text-white ml-0.5" />
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-700 truncate">{recording.title}</p>
                <p className="text-[10px] sm:text-xs text-gray-400 truncate">{recording.scenario} • {recording.duration}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExpertCard;
