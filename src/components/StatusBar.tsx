import React from 'react';
import { Activity, Pause, Play } from 'lucide-react';
import type { MediaState } from '../types/media.ts';

interface StatusBarProps {
  mediaState: MediaState;
}

export const StatusBar: React.FC<StatusBarProps> = ({ mediaState }) => {
  const activeSource = mediaState.sources.find(s => s.id === mediaState.activeSource);
  const playingSources = mediaState.sources.filter(s => s.isPlaying);

  return (
    <div className="bg-gray-900 border-t border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-gray-300">MediaSense Status</span>
          </div>

          {activeSource ? (
            <div className="flex items-center space-x-2">
              {activeSource.isPlaying ? (
                <Play className="w-3 h-3 text-green-400" />
              ) : (
                <Pause className="w-3 h-3 text-yellow-400" />
              )}
              <span className="text-sm text-white">
                {activeSource.name}: {activeSource.currentTrack}
              </span>
            </div>
          ) : (
            <span className="text-sm text-gray-400">No active media</span>
          )}
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-xs text-gray-400">
            Active Sources: {playingSources.length}
          </div>
          <div className="flex space-x-1">
            {mediaState.sources.map(source => (
              <div
                key={source.id}
                className={`w-2 h-2 rounded-full transition-colors duration-200 ${source.isPlaying
                  ? 'bg-green-400'
                  : source.isPaused
                    ? 'bg-yellow-400'
                    : 'bg-gray-600'
                  }`}
                title={`${source.name} - ${source.isPlaying ? 'Playing' : source.isPaused ? 'Paused' : 'Stopped'}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};