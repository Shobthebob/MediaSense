import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Activity, Zap } from 'lucide-react';
import { MediaCard } from './components/MediaCard';
import { StatusBar } from './components/StatusBar';
import { SettingsPanel } from './components/SettingsPanel';
import { useMediaManager } from './hooks/useMediaManager';

function App() {
    const {
        mediaState,
        togglePlayPause,
        setVolume,
        setPriority,
        updateSource
    } = useMediaManager();

    const [showSettings, setShowSettings] = useState(false);
    const [simulatePlayback, setSimulatePlayback] = useState(false);

    // Simulate some playback progress for demo
    useEffect(() => {
        if (!simulatePlayback) return;

        const interval = setInterval(() => {
            mediaState.sources.forEach(source => {
                if (source.isPlaying) {
                    const newTime = (source.currentTime || 0) + 1;
                    const duration = source.duration || 180; // 3 minutes default

                    updateSource(source.id, {
                        currentTime: newTime > duration ? 0 : newTime,
                        currentTrack: source.id === 'youtube'
                            ? 'Building Amazing Web Apps with React & TypeScript'
                            : 'Synthwave Dreams - Neon Nights'
                    });
                }
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [simulatePlayback, mediaState.sources, updateSource]);

    // Initialize with some demo content
    useEffect(() => {
        updateSource('youtube', {
            currentTrack: 'Building Amazing Web Apps with React & TypeScript',
            duration: 1230, // 20:30
            currentTime: 340 // 5:40
        });

        updateSource('spotify', {
            currentTrack: 'Synthwave Dreams - Neon Nights',
            duration: 240, // 4:00
            currentTime: 87 // 1:27
        });
    }, [updateSource]);

    const handleDemoPlay = (sourceId: string) => {
        setSimulatePlayback(true);
        togglePlayPause(sourceId);
    };

    return (
        <div className="bg-primary min-h-screen">
            {/* Header */}
            <header className="border-b border-muted sticky top-0 z-50 bg-primary/95 backdrop-blur-sm">
                <div className="container">
                    <div className="flex-between py-6">
                        <div className="flex items-center gap-4">
                            <div className="card-elevated p-3 border-accent">
                                <Activity className="w-7 h-7 text-accent" />
                            </div>
                            <div>
                                <h1 className="text-display text-accent">MediaSense</h1>
                                <p className="text-body text-secondary">Intelligent Media Playback Manager</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="surface px-4 py-2 rounded-lg border border-warning/30">
                                <div className="flex items-center gap-2">
                                    <Zap className="w-4 h-4 text-warning" />
                                    <span className="text-caption font-medium text-warning">Demo Mode</span>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowSettings(true)}
                                className="btn btn-secondary btn-icon"
                            >
                                <SettingsIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container py-8">
                {/* Info Banner */}
                <section className="mb-8">
                    <div className="card bg-elevated border-accent/20">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-tertiary border border-accent/30 rounded-lg">
                                <Activity className="w-6 h-6 text-accent" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-heading text-primary mb-3">How MediaSense Works</h3>
                                <p className="text-body text-secondary leading-relaxed mb-4">
                                    MediaSense intelligently manages your media playback with <strong className="text-accent">priority-based control</strong>.
                                    When you start playing one source, other sources are automatically paused based on priority.
                                    This prevents audio overlap and ensures a <strong className="text-success">seamless experience</strong> across different media applications.
                                </p>
                                <div className="flex items-center gap-6">
                                    <div className="flex items-center gap-2">
                                        <div className="status-indicator status-playing"></div>
                                        <span className="text-caption text-success font-medium">Priority Source Active</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="status-indicator status-paused"></div>
                                        <span className="text-caption text-warning font-medium">Lower Priority Paused</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Media Sources Grid */}
                <section className="mb-8">
                    <h2 className="text-title text-primary mb-6">Media Sources</h2>
                    <div className="grid-2">
                        {mediaState.sources.map(source => (
                            <MediaCard
                                key={source.id}
                                source={source}
                                isActive={mediaState.activeSource === source.id}
                                onTogglePlay={() => handleDemoPlay(source.id)}
                                onVolumeChange={(volume) => setVolume(source.id, volume)}
                            />
                        ))}
                    </div>
                </section>

                {/* Demo Instructions */}
                <section>
                    <div className="card">
                        <h3 className="text-heading text-primary mb-6">Demo Instructions</h3>
                        <div className="grid-2">
                            <div className="stack">
                                <h4 className="text-body font-semibold text-accent mb-4 flex items-center">
                                    <div className="status-indicator status-playing mr-3"></div>
                                    Try This:
                                </h4>
                                <ul className="stack-sm text-secondary">
                                    <li className="flex items-center gap-3">
                                        <span className="w-2 h-2 bg-accent rounded-full"></span>
                                        <span>Start playing <strong className="text-accent">YouTube</strong> (Priority 1)</span>
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <span className="w-2 h-2 bg-accent rounded-full"></span>
                                        <span>Notice <strong className="text-success">Spotify</strong> automatically pauses</span>
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <span className="w-2 h-2 bg-accent rounded-full"></span>
                                        <span>Pause YouTube and see Spotify <strong className="text-warning">resume</strong></span>
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <span className="w-2 h-2 bg-accent rounded-full"></span>
                                        <span>Adjust <strong className="text-accent">priorities</strong> in settings</span>
                                    </li>
                                </ul>
                            </div>
                            <div className="stack">
                                <h4 className="text-body font-semibold text-success mb-4 flex items-center">
                                    <div className="status-indicator status-playing mr-3"></div>
                                    Desktop Features:
                                </h4>
                                <ul className="stack-sm text-secondary">
                                    <li className="flex items-center gap-3">
                                        <span className="w-2 h-2 bg-success rounded-full"></span>
                                        <span><strong className="text-success">System tray</strong> integration</span>
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <span className="w-2 h-2 bg-success rounded-full"></span>
                                        <span><strong className="text-success">Global hotkey</strong> support</span>
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <span className="w-2 h-2 bg-success rounded-full"></span>
                                        <span><strong className="text-success">API integration</strong> with real apps</span>
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <span className="w-2 h-2 bg-success rounded-full"></span>
                                        <span><strong className="text-success">Cross-platform</strong> compatibility</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Status Bar */}
            <StatusBar mediaState={mediaState} />

            {/* Settings Panel */}
            {showSettings && (
                <SettingsPanel
                    sources={mediaState.sources}
                    onPriorityChange={setPriority}
                    onClose={() => setShowSettings(false)}
                />
            )}
        </div>
    );
}

export default App;
