import React from 'react';
import { Play, Pause, Volume2, Monitor, Music } from 'lucide-react';
import type { MediaSource } from '../types/media';

interface MediaCardProps {
  source: MediaSource;
  isActive: boolean;
  onTogglePlay: () => void;
  onVolumeChange: (volume: number) => void;
}

export const MediaCard: React.FC<MediaCardProps> = ({
  source,
  isActive,
  onTogglePlay,
  onVolumeChange
}) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusIndicator = () => {
    if (source.isPlaying) return 'status-playing';
    if (source.isPaused) return 'status-paused';
    return 'status-stopped';
  };

  const getStatusText = () => {
    if (source.isPlaying) return 'Playing';
    if (source.isPaused) return 'Paused';
    return 'Stopped';
  };

  const progressPercentage = source.duration
    ? ((source.currentTime || 0) / source.duration) * 100
    : 0;

  return (
    <div className={`card ${isActive ? 'border-accent shadow-accent' : ''} animate-fade-in`}>
      {/* Header */}
      <div className="flex-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-tertiary rounded-lg border border-muted">
            {source.type === 'video' ? (
              <Monitor className="w-5 h-5 text-error" />
            ) : (
              <Music className="w-5 h-5 text-success" />
            )}
          </div>
          <div>
            <h3 className="text-heading text-primary">{source.name}</h3>
            <div className="flex items-center gap-2">
              <div className={`status-indicator ${getStatusIndicator()}`}></div>
              <span className="text-caption text-secondary">{getStatusText()}</span>
              <span className="text-caption text-muted">• Priority {source.priority}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Current Track */}
      {source.currentTrack && (
        <div className="mb-4">
          <p className="text-body text-primary font-medium mb-1">Now Playing</p>
          <p className="text-caption text-secondary line-clamp-2">{source.currentTrack}</p>
        </div>
      )}

      {/* Progress Bar */}
      {source.duration && (
        <div className="mb-4">
          <div className="progress mb-2">
            <div
              className="progress-fill"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <div className="flex-between text-caption text-muted">
            <span>{formatTime(source.currentTime || 0)}</span>
            <span>{formatTime(source.duration)}</span>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onTogglePlay}
            className={`btn ${source.isPlaying ? 'btn-secondary' : 'btn-primary'} btn-icon`}
            aria-label={source.isPlaying ? 'Pause' : 'Play'}
          >
            {source.isPlaying ? (
              <Pause className="w-5 h-5" />
            ) : (
              <Play className="w-5 h-5 ml-0.5" />
            )}
          </button>

          {source.isPlaying && (
            <div className="status-indicator status-playing animate-pulse-subtle"></div>
          )}
        </div>

        {/* Volume Control */}
        <div className="flex items-center gap-3">
          <Volume2 className="w-4 h-4 text-tertiary" />
          <div className="w-20">
            <input
              type="range"
              min="0"
              max="100"
              value={source.volume}
              onChange={(e) => onVolumeChange(parseInt(e.target.value))}
              className="slider w-full"
              aria-label={`Volume for ${source.name}`}
            />
          </div>
          <span className="text-caption text-muted font-mono w-8 text-right">
            {source.volume}%
          </span>
        </div>
      </div>
    </div>
  );
};
