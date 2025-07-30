import React from 'react';
import { Play, Pause, Volume2, Settings, Monitor, Music } from 'lucide-react';
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

  const getStatusColor = () => {
    if (source.isPlaying) return 'text-green-400';
    if (isActive) return 'text-blue-400';
    return 'text-gray-400';
  };

  const getStatusText = () => {
    if (source.isPlaying) return 'Playing';
    if (source.isPaused) return 'Paused';
    return 'Stopped';
  };

  return (
    <div className={`bg-gray-800 rounded-xl p-6 transition-all duration-300 ${isActive ? 'ring-2 ring-blue-500 shadow-lg shadow-blue-500/20' : 'hover:bg-gray-750'
      }`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${source.type === 'video' ? 'bg-red-500/20' : 'bg-green-500/20'}`}>
            {source.type === 'video' ? (
              <Monitor className={`w-5 h-5 ${source.type === 'video' ? 'text-red-400' : 'text-green-400'}`} />
            ) : (
              <Music className="w-5 h-5 text-green-400" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">{source.name}</h3>
            <span className={`text-sm ${getStatusColor()}`}>{getStatusText()}</span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-400">Priority: {source.priority}</span>
          <Settings className="w-4 h-4 text-gray-400 cursor-pointer hover:text-white" />
        </div>
      </div>

      {/* Current Track */}
      <div className="mb-4">
        <p className="text-gray-300 text-sm mb-1">Now Playing:</p>
        <p className="text-white font-medium truncate">{source.currentTrack}</p>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>{formatTime(source.currentTime || 0)}</span>
          <span>{formatTime(source.duration || 0)}</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-1">
          <div
            className={`h-1 rounded-full transition-all duration-300 ${source.isPlaying ? 'bg-blue-500' : 'bg-gray-500'
              }`}
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
          className={`flex items-center justify-center w-12 h-12 rounded-full transition-all duration-200 ${source.isPlaying
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
        >
          {source.isPlaying ? (
            <Pause className="w-5 h-5" />
          ) : (
            <Play className="w-5 h-5 ml-0.5" />
          )}
        </button>

        <div className="flex items-center space-x-3">
          <Volume2 className="w-4 h-4 text-gray-400" />
          <input
            type="range"
            min="0"
            max="100"
            value={source.volume}
            onChange={(e) => onVolumeChange(parseInt(e.target.value))}
            className="w-20 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
          />
          <span className="text-xs text-gray-400 w-8">{source.volume}%</span>
        </div>
      </div>
    </div>
  );
};