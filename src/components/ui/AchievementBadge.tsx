import React from 'react';
import { Lock, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AchievementBadgeProps {
  name: string;
  description: string;
  icon: string;
  earned: boolean;
  earnedDate?: string;
  size?: 'sm' | 'md' | 'lg';
}

const AchievementBadge: React.FC<AchievementBadgeProps> = ({
  name,
  description,
  icon,
  earned,
  earnedDate,
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'text-2xl',
    md: 'text-3xl',
    lg: 'text-4xl'
  };

  const containerClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6'
  };

  return (
    <div
      className={cn(
        'relative bg-white rounded-xl border-2 transition-all duration-300',
        containerClasses[size],
        earned 
          ? 'border-[#4CAF50] shadow-sm hover:shadow-md' 
          : 'border-gray-200 opacity-60'
      )}
      title={earned && earnedDate ? `Earned on ${earnedDate}` : 'Not earned yet'}
    >
      {/* Lock overlay for unearned badges */}
      {!earned && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/50 rounded-xl backdrop-blur-[1px]">
          <Lock className="w-6 h-6 text-gray-400" />
        </div>
      )}

      {/* Badge icon */}
      <div className="flex items-center justify-center mb-2">
        <span className={cn(sizeClasses[size], earned ? '' : 'grayscale')} role="img" aria-label={name}>
          {icon}
        </span>
      </div>

      {/* Badge name */}
      <h4 className={cn(
        'font-semibold text-center mb-1',
        size === 'sm' ? 'text-xs' : 'text-sm',
        earned ? 'text-gray-800' : 'text-gray-500'
      )}>
        {name}
      </h4>

      {/* Badge description */}
      <p className={cn(
        'text-center leading-tight',
        size === 'sm' ? 'text-[10px]' : 'text-xs',
        earned ? 'text-gray-600' : 'text-gray-400'
      )}>
        {description}
      </p>

      {/* Earned indicator */}
      {earned && (
        <div className="absolute -top-2 -right-2 bg-[#4CAF50] rounded-full p-1 shadow-md">
          <CheckCircle2 className="w-4 h-4 text-white" />
        </div>
      )}

      {/* Earned date */}
      {earned && earnedDate && size !== 'sm' && (
        <div className="mt-2 pt-2 border-t border-gray-100">
          <p className="text-[10px] text-gray-500 text-center">
            {earnedDate}
          </p>
        </div>
      )}
    </div>
  );
};

export default AchievementBadge;
