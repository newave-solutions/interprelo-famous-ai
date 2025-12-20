import React, { useEffect, useRef, useState } from 'react';

interface WaveformVisualizerProps {
  isActive?: boolean;
  color?: string;
  height?: number;
  barCount?: number;
  className?: string;
  waveformData?: Uint8Array | null;
}

const WaveformVisualizer: React.FC<WaveformVisualizerProps> = ({
  isActive = true,
  color = '#2C5F8D',
  height = 60,
  barCount = 40,
  className = '',
  waveformData = null,
}) => {
  const [bars, setBars] = useState<number[]>([]);
  const animationRef = useRef<number>();

  useEffect(() => {
    // Initialize bars with random heights
    const initialBars = Array.from({ length: barCount }, () => Math.random() * 0.5 + 0.2);
    setBars(initialBars);

    if (isActive) {
      const animate = () => {
        if (waveformData) {
          // Use real audio data
          const step = Math.floor(waveformData.length / barCount);
          const newBars = Array.from({ length: barCount }, (_, i) => {
            const index = i * step;
            const value = waveformData[index] / 255; // Normalize to 0-1
            return Math.max(0.1, value);
          });
          setBars(newBars);
        } else {
          // Fallback to simulated waveform
          setBars(prev => prev.map((bar, i) => {
            const time = Date.now() / 1000;
            const wave = Math.sin(time * 3 + i * 0.3) * 0.3;
            const random = (Math.random() - 0.5) * 0.1;
            const newHeight = Math.max(0.1, Math.min(1, bar + wave * 0.1 + random));
            return newHeight;
          }));
        }
        animationRef.current = requestAnimationFrame(animate);
      };
      animationRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isActive, barCount, waveformData]);

  return (
    <div 
      className={`flex items-center justify-center gap-[2px] ${className}`}
      style={{ height }}
    >
      {bars.map((barHeight, index) => (
        <div
          key={index}
          className="rounded-full transition-all duration-75"
          style={{
            width: '3px',
            height: `${barHeight * height}px`,
            backgroundColor: color,
            opacity: isActive ? 0.8 + barHeight * 0.2 : 0.3,
          }}
        />
      ))}
    </div>
  );
};

export default WaveformVisualizer;
