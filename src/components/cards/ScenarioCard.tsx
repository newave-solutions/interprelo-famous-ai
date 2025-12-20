import React from 'react';
import { Clock, Lock, ChevronRight, Star } from 'lucide-react';
import { Scenario } from '../../data/appData';

interface ScenarioCardProps {
  scenario: Scenario;
  onClick: (scenario: Scenario) => void;
}

const difficultyColors = {
  Beginner: 'bg-green-100 text-green-700',
  Intermediate: 'bg-amber-100 text-amber-700',
  Advanced: 'bg-red-100 text-red-700',
};

const ScenarioCard: React.FC<ScenarioCardProps> = ({ scenario, onClick }) => {
  const { title, category, difficulty, duration, description, image, unlocked } = scenario;

  return (
    <div
      onClick={() => unlocked && onClick(scenario)}
      className={`relative bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 transition-all duration-300 ${
        unlocked
          ? 'hover:shadow-xl hover:-translate-y-1 cursor-pointer'
          : 'opacity-70 cursor-not-allowed'
      }`}
    >
      {/* Image */}
      <div className="relative h-40 overflow-hidden">
        <img
          src={image}
          alt={title}
          className={`w-full h-full object-cover ${!unlocked ? 'filter grayscale' : ''}`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        
        {/* Category Badge */}
        <span className="absolute top-3 left-3 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium text-gray-700">
          {category}
        </span>
        
        {/* Lock Overlay */}
        {!unlocked && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <div className="bg-white/90 backdrop-blur-sm p-3 rounded-full">
              <Lock className="w-6 h-6 text-gray-600" />
            </div>
          </div>
        )}
        
        {/* Duration */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1 text-white text-sm">
          <Clock className="w-4 h-4" />
          <span>{duration}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-3 sm:p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-sm sm:text-base font-semibold text-gray-800 line-clamp-1">{title}</h3>
          <span className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium flex-shrink-0 ${difficultyColors[difficulty]}`}>
            {difficulty}
          </span>
        </div>
        
        <p className="text-xs sm:text-sm text-gray-500 line-clamp-2 mb-2 sm:mb-3">{description}</p>
        
        {unlocked ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-4 h-4 ${star <= 3 ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`}
                />
              ))}
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
        ) : (
          <p className="text-xs text-gray-400">Complete previous scenarios to unlock</p>
        )}
      </div>
    </div>
  );
};

export default ScenarioCard;
