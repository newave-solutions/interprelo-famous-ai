import React from 'react';

interface VocalMeterProps {
  label: string;
  value: number; // 0-100
  targetMin?: number;
  targetMax?: number;
  unit?: string;
  color: string;
  icon: React.ReactNode;
}

const VocalMeter: React.FC<VocalMeterProps> = ({
  label,
  value,
  targetMin = 40,
  targetMax = 60,
  unit = '',
  color,
  icon,
}) => {
  const isInRange = value >= targetMin && value <= targetMax;
  const status = value < targetMin ? 'low' : value > targetMax ? 'high' : 'optimal';
  
  const statusColors = {
    low: 'text-blue-500',
    high: 'text-coral-500',
    optimal: 'text-green-500',
  };

  const statusLabels = {
    low: 'Too Low',
    high: 'Too High',
    optimal: 'Optimal',
  };

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg" style={{ backgroundColor: `${color}15` }}>
            {icon}
          </div>
          <span className="font-medium text-gray-700">{label}</span>
        </div>
        <span className={`text-sm font-semibold ${statusColors[status]}`}>
          {statusLabels[status]}
        </span>
      </div>
      
      {/* Meter Track */}
      <div className="relative h-8 bg-gray-100 rounded-full overflow-hidden">
        {/* Target Zone */}
        <div 
          className="absolute h-full bg-green-100 opacity-50"
          style={{
            left: `${targetMin}%`,
            width: `${targetMax - targetMin}%`,
          }}
        />
        
        {/* Current Value Indicator */}
        <div 
          className="absolute top-1/2 -translate-y-1/2 w-4 h-6 rounded-full shadow-lg transition-all duration-200"
          style={{
            left: `calc(${Math.min(100, Math.max(0, value))}% - 8px)`,
            backgroundColor: isInRange ? '#4CAF50' : '#FF6B6B',
          }}
        />
        
        {/* Scale markers */}
        <div className="absolute inset-0 flex justify-between px-2 items-center">
          {[0, 25, 50, 75, 100].map((mark) => (
            <div key={mark} className="w-px h-3 bg-gray-300" />
          ))}
        </div>
      </div>
      
      {/* Value Display */}
      <div className="flex justify-between items-center mt-2">
        <span className="text-xs text-gray-400">0{unit}</span>
        <span className="text-lg font-bold" style={{ color }}>
          {value}{unit}
        </span>
        <span className="text-xs text-gray-400">100{unit}</span>
      </div>
    </div>
  );
};

export default VocalMeter;
