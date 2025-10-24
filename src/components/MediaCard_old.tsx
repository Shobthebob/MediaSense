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
    if (source.isPlaying) return 'Playing';
    if (source.isPaused) return 'Paused';
    return 'Stopped';
  };

  return (
    <div className={`media-card rounded-2xl p-6 ${isActive ? 'active' : ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div className={`relative p-3 rounded-xl ${source.type === 'video' ? 'bg-red-500/20' : 'bg-green-500/20'}`}>
            {source.type === 'video' ? (
              <Monitor className={`w-6 h-6 ${source.type === 'video' ? 'text-red-400' : 'text-green-400'}`} />
            ) : (
              <Music className="w-6 h-6 text-green-400" />
            )}
            {source.isPlaying && <div className="pulse-ring"></div>}
          </div>
          <div>
            <h3 className="text-xl font-bold text-white mb-1">{source.name}</h3>
            <div className="flex items-center space-x-2">
              <span className={`w-2 h-2 rounded-full status-dot ${source.isPlaying ? 'playing bg-green-400' : source.isPaused ? 'paused bg-yellow-400' : 'bg-gray-400'}`}></span>
              <span className={`text-sm font-medium ${getStatusColor()}`}>{getStatusText()}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div className="px-3 py-1 glass rounded-lg">
            <span className="text-xs font-semibold text-blue-300">P{source.priority}</span>
          </div>
          <button className="btn-secondary p-2 rounded-lg focus-ring">
            <Settings className="w-4 h-4 text-gray-300" />
          </button>
        </div>
      </div>

      {/* Current Track */}
      <div className="mb-6">
        <p className="text-gray-400 text-sm mb-2 font-medium">Now Playing:</p>
        <p className="text-white font-bold text-lg truncate bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
          {source.currentTrack}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm font-medium text-gray-300 mb-3">
          <span className="text-blue-300">{formatTime(source.currentTime || 0)}</span>
          <span className="text-gray-400">{formatTime(source.duration || 0)}</span>
        </div>
        <div className="progress-bar h-2">
          <div
            className="progress-fill"
            style={{
              width: source.duration ? `${((source.currentTime || 0) / source.duration) * 100}%` : '0%'
            }}
          />
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <button
          onClick={onTogglePlay}
          className={`relative flex items-center justify-center w-16 h-16 rounded-full transition-all duration-300 focus-ring ${source.isPlaying
              ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg shadow-red-500/40'
              : 'btn-primary shadow-lg'
            }`}
        >
          {source.isPlaying ? (
            <Pause className="w-6 h-6" />
          ) : (
            <Play className="w-6 h-6 ml-0.5" />
          )}
          {source.isPlaying && (
            <div className="absolute inset-0 rounded-full border-2 border-red-300/50 animate-ping"></div>
          )}
        </button>

        <div className="flex items-center space-x-4">
          <Volume2 className="w-5 h-5 text-gray-300" />
          <input
            type="range"
            min="0"
            max="100"
            value={source.volume}
            onChange={(e) => onVolumeChange(parseInt(e.target.value))}
            className="w-24 slider focus-ring"
          />
          <span className="text-sm font-bold text-gray-300 w-10 text-center">
            {source.volume}%
          </span>
        </div>
      </div>
    </div>
  );
};