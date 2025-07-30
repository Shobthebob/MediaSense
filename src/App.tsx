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
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Activity className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">MediaSense</h1>
              <p className="text-sm text-gray-400">Intelligent Media Playback Manager</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <Zap className="w-4 h-4" />
              <span>Demo Mode</span>
            </div>
            <button
              onClick={() => setShowSettings(true)}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <SettingsIcon className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        <div className="max-w-4xl mx-auto">
          {/* Info Banner */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <Activity className="w-5 h-5 text-blue-400 mt-0.5" />
              <div>
                <h3 className="text-blue-400 font-semibold mb-1">How MediaSense Works</h3>
                <p className="text-sm text-gray-300">
                  MediaSense intelligently manages your media playback. When you start playing one source,
                  other sources are automatically paused based on priority. This prevents audio overlap
                  and ensures a seamless experience across different media applications.
                </p>
              </div>
            </div>
          </div>

          {/* Media Sources Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
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

          {/* Demo Instructions */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Demo Instructions</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium text-blue-400 mb-2">Try This:</h4>
                <ul className="space-y-1 text-gray-300">
                  <li>• Start playing YouTube (Priority 1)</li>
                  <li>• Notice Spotify automatically pauses</li>
                  <li>• Pause YouTube and see Spotify resume</li>
                  <li>• Adjust volume and priority settings</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-green-400 mb-2">Desktop Features:</h4>
                <ul className="space-y-1 text-gray-300">
                  <li>• System tray integration</li>
                  <li>• Global hotkey support</li>
                  <li>• API integration with real apps</li>
                  <li>• Cross-platform compatibility</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
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