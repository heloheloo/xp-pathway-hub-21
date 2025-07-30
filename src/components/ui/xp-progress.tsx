import React from 'react';
import { Progress } from './progress';
import { cn } from '@/lib/utils';

interface XPProgressProps {
  currentXP: number;
  level: number;
  className?: string;
  showLabel?: boolean;
}

const getXPForLevel = (level: number) => level * 100;
const getLevelFromXP = (xp: number) => Math.floor(xp / 100) + 1;
const getXPForNextLevel = (level: number) => (level + 1) * 100;

export const XPProgress: React.FC<XPProgressProps> = ({ 
  currentXP, 
  level, 
  className,
  showLabel = true 
}) => {
  const currentLevelXP = getXPForLevel(level - 1);
  const nextLevelXP = getXPForNextLevel(level - 1);
  const progressXP = currentXP - currentLevelXP;
  const levelXPRange = nextLevelXP - currentLevelXP;
  const progressPercentage = (progressXP / levelXPRange) * 100;

  const getLevelBadge = (level: number) => {
    if (level >= 10) return '👑';
    if (level >= 8) return '🥇';
    if (level >= 6) return '🥈';
    if (level >= 4) return '🥉';
    return '🌟';
  };

  return (
    <div className={cn('space-y-2', className)}>
      {showLabel && (
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2 font-medium">
            <span className="text-lg">{getLevelBadge(level)}</span>
            Level {level}
          </span>
          <span className="text-muted-foreground">
            {currentXP} / {nextLevelXP} XP
          </span>
        </div>
      )}
      <Progress 
        value={progressPercentage} 
        className="h-3 bg-secondary"
      />
    </div>
  );
};