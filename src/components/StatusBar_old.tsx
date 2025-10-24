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
    <div className="glass-card border-t border-white/10 px-6 py-4 sticky bottom-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-blue-500/20">
              <Activity className="w-5 h-5 text-blue-400" />
            </div>
            <span className="text-sm font-semibold text-gray-200">MediaSense Status</span>
          </div>

          {activeSource ? (
            <div className="flex items-center space-x-3 px-4 py-2 glass rounded-lg">
              <div className="relative">
                {activeSource.isPlaying ? (
                  <Play className="w-4 h-4 text-green-400" />
                ) : (
                  <Pause className="w-4 h-4 text-yellow-400" />
                )}
                <div className={`absolute inset-0 rounded-full status-dot ${activeSource.isPlaying ? 'playing' : 'paused'}`}></div>
              </div>
              <span className="text-sm font-medium text-white">
                <span className="text-blue-400">{activeSource.name}</span>: {activeSource.currentTrack}
              </span>
            </div>
          ) : (
            <div className="px-4 py-2 glass rounded-lg">
              <span className="text-sm text-gray-400">No active media</span>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-6">
          <div className="px-3 py-1 glass rounded-lg">
            <span className="text-xs font-bold text-blue-300">
              Active: {playingSources.length}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-medium text-gray-400 mr-2">Sources:</span>
            <div className="flex space-x-2">
              {mediaState.sources.map(source => (
                <div
                  key={source.id}
                  className={`relative w-3 h-3 rounded-full transition-all duration-300 ${source.isPlaying
                    ? 'bg-green-400 shadow-lg shadow-green-400/50'
                    : source.isPaused
                      ? 'bg-yellow-400 shadow-lg shadow-yellow-400/50'
                      : 'bg-gray-500'
                    }`}
                  title={`${source.name} - ${source.isPlaying ? 'Playing' : source.isPaused ? 'Paused' : 'Stopped'}`}
                >
                  {source.isPlaying && (
                    <div className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-75"></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};