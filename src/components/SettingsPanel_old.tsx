import React, { useState } from 'react';
import { Settings, X, Keyboard, Volume2, Layers } from 'lucide-react';
import type { MediaSource, HotKey } from '../types/media.ts';

interface SettingsPanelProps {
  sources: MediaSource[];
  onPriorityChange: (sourceId: string, priority: number) => void;
  onClose: () => void;
}

const defaultHotkeys: HotKey[] = [
  { id: '1', key: 'Space', action: 'Toggle Active Media', description: 'Play/pause the currently active media source' },
  { id: '2', key: 'Ctrl+1', action: 'Toggle YouTube', description: 'Play/pause YouTube video' },
  { id: '3', key: 'Ctrl+2', action: 'Toggle Spotify', description: 'Play/pause Spotify music' },
  { id: '4', key: 'Ctrl+Shift+M', action: 'Mute All', description: 'Mute all media sources' }
];

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  sources,
  onPriorityChange,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<string>('priorities');

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="settings-panel rounded-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-8 border-b border-white/10">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-xl gradient-bg relative">
              <Settings className="w-6 h-6 text-white relative z-10" />
              <div className="pulse-ring"></div>
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              MediaSense Settings
            </h2>
          </div>
          <button
            onClick={onClose}
            className="btn-secondary p-3 rounded-xl focus-ring"
          >
            <X className="w-5 h-5 text-gray-300" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10 bg-gradient-to-r from-gray-800/50 to-gray-900/50">
          {[
            { id: 'priorities', label: 'Priority', icon: Layers },
            { id: 'hotkeys', label: 'Hotkeys', icon: Keyboard },
            { id: 'general', label: 'General', icon: Volume2 }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex items-center space-x-3 px-8 py-4 border-b-2 transition-all duration-300 focus-ring ${activeTab === tab.id
                ? 'border-blue-500 text-blue-400 bg-blue-500/10'
                : 'border-transparent text-gray-400 hover:text-white hover:bg-white/5'
                }`}
            >
              <tab.icon className="w-5 h-5" />
              <span className="font-medium">{tab.label}</span>
              {activeTab === tab.id && (
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-t-lg"></div>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto max-h-96">
          {activeTab === 'priorities' && (
            <div className="space-y-6">
              <div className="glass rounded-xl p-4">
                <p className="text-gray-300 text-sm leading-relaxed">
                  <span className="text-blue-400 font-semibold">Lower numbers</span> have higher priority. 
                  When a higher priority source starts playing, lower priority sources will be 
                  <span className="text-yellow-400 font-semibold"> paused automatically</span>.
                </p>
              </div>
              {sources.map(source => (
                <div key={source.id} className="glass-card rounded-xl p-6 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5"></div>
                  <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-4 h-4 rounded-full ${source.type === 'video' ? 'bg-red-400' : 'bg-green-400'} shadow-lg ${source.type === 'video' ? 'shadow-red-400/50' : 'shadow-green-400/50'}`} />
                      <span className="text-white font-semibold text-lg">{source.name}</span>
                      <span className="text-xs text-gray-400 px-2 py-1 glass rounded-lg">({source.type})</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="text-sm font-medium text-gray-300">Priority:</span>
                      <select
                        value={source.priority}
                        onChange={(e) => onPriorityChange(source.id, parseInt(e.target.value))}
                        className="glass rounded-lg px-4 py-2 text-white font-medium focus-ring border border-white/20"
                      >
                        <option value={1} className="bg-gray-800">1 (Highest)</option>
                        <option value={2} className="bg-gray-800">2</option>
                        <option value={3} className="bg-gray-800">3</option>
                        <option value={4} className="bg-gray-800">4 (Lowest)</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'hotkeys' && (
            <div className="space-y-6">
              <div className="glass rounded-xl p-4">
                <p className="text-gray-300 text-sm leading-relaxed">
                  Configure <span className="text-blue-400 font-semibold">keyboard shortcuts</span> for quick media control.
                </p>
              </div>
              {defaultHotkeys.map(hotkey => (
                <div key={hotkey.id} className="glass-card rounded-xl p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-white font-semibold text-lg mb-2">{hotkey.action}</div>
                      <div className="text-sm text-gray-300">{hotkey.description}</div>
                    </div>
                    <div className="glass px-4 py-2 rounded-lg text-blue-300 text-sm font-mono font-bold border border-blue-400/30">
                      {hotkey.key}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'general' && (
            <div className="space-y-6">
              <div className="glass-card rounded-xl p-6">
                <label className="flex items-center space-x-4 cursor-pointer">
                  <input type="checkbox" className="w-5 h-5 text-blue-500 bg-transparent border-2 border-gray-400 rounded focus:ring-blue-500 focus:ring-2" defaultChecked />
                  <div>
                    <span className="text-white font-semibold text-lg">Enable system tray icon</span>
                    <p className="text-sm text-gray-300 mt-1">Show MediaSense status in system tray</p>
                  </div>
                </label>
              </div>

              <div className="glass-card rounded-xl p-6">
                <label className="flex items-center space-x-4 cursor-pointer">
                  <input type="checkbox" className="w-5 h-5 text-blue-500 bg-transparent border-2 border-gray-400 rounded focus:ring-blue-500 focus:ring-2" defaultChecked />
                  <div>
                    <span className="text-white font-semibold text-lg">Auto-pause on focus loss</span>
                    <p className="text-sm text-gray-300 mt-1">Pause media when switching away from the application</p>
                  </div>
                </label>
              </div>

              <div className="glass-card rounded-xl p-6">
                <label className="flex items-center space-x-4 cursor-pointer">
                  <input type="checkbox" className="w-5 h-5 text-blue-500 bg-transparent border-2 border-gray-400 rounded focus:ring-blue-500 focus:ring-2" />
                  <div>
                    <span className="text-white font-semibold text-lg">Show floating overlay</span>
                    <p className="text-sm text-gray-300 mt-1">Display current playback status in a floating window</p>
                  </div>
                </label>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};