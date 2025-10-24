import React from 'react';
import { Activity, Play, Pause } from 'lucide-react';
import type { MediaState } from '../types/media';

interface StatusBarProps {
    mediaState: MediaState;
}

export const StatusBar: React.FC<StatusBarProps> = ({ mediaState }) => {
    const activeSource = mediaState.sources.find(s => s.id === mediaState.activeSource);
    const playingSources = mediaState.sources.filter(s => s.isPlaying);
    const pausedSources = mediaState.sources.filter(s => s.isPaused);

    return (
        <div className="bg-elevated border-t border-muted fixed bottom-0 left-0 right-0 z-40">
            <div className="container">
                <div className="flex-between py-4">
                    {/* Left: Current Active Source */}
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-tertiary rounded-lg border border-accent/30">
                            <Activity className="w-5 h-5 text-accent" />
                        </div>
                        <div>
                            {activeSource ? (
                                <>
                                    <p className="text-body font-medium text-primary">
                                        Active: {activeSource.name}
                                    </p>
                                    <p className="text-caption text-secondary">
                                        {activeSource.currentTrack || 'No track selected'}
                                    </p>
                                </>
                            ) : (
                                <>
                                    <p className="text-body font-medium text-primary">No Active Source</p>
                                    <p className="text-caption text-secondary">All sources are paused</p>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Right: Status Overview */}
                    <div className="flex items-center gap-6">
                        {playingSources.length > 0 && (
                            <div className="flex items-center gap-2">
                                <div className="status-indicator status-playing"></div>
                                <Play className="w-4 h-4 text-success" />
                                <span className="text-caption font-medium text-success">
                                    {playingSources.length} Playing
                                </span>
                            </div>
                        )}

                        {pausedSources.length > 0 && (
                            <div className="flex items-center gap-2">
                                <div className="status-indicator status-paused"></div>
                                <Pause className="w-4 h-4 text-warning" />
                                <span className="text-caption font-medium text-warning">
                                    {pausedSources.length} Paused
                                </span>
                            </div>
                        )}

                        {/* Priority Indicator */}
                        {activeSource && (
                            <div className="surface px-3 py-1 rounded-lg border border-accent/20">
                                <span className="text-caption font-medium text-accent">
                                    Priority {activeSource.priority}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
