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
  const [activeTab, setActiveTab] = useState<'priorities' | 'hotkeys' | 'general'>('priorities');

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <Settings className="w-5 h-5 text-blue-400" />
            <h2 className="text-xl font-semibold text-white">MediaSense Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-700">
          {[
            { id: 'priorities', label: 'Priority', icon: Layers },
            { id: 'hotkeys', label: 'Hotkeys', icon: Keyboard },
            { id: 'general', label: 'General', icon: Volume2 }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'priorities' | 'hotkeys' | 'general')}
              className={`flex items-center space-x-2 px-6 py-4 border-b-2 transition-colors ${activeTab === tab.id
                ? 'border-blue-500 text-blue-400 bg-gray-750'
                : 'border-transparent text-gray-400 hover:text-white hover:bg-gray-750'
                }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-96">
          {activeTab === 'priorities' && (
            <div className="space-y-4">
              <p className="text-gray-300 text-sm mb-4">
                Lower numbers have higher priority. When a higher priority source starts playing,
                lower priority sources will be paused automatically.
              </p>
              {sources.map(source => (
                <div key={source.id} className="flex items-center justify-between p-4 bg-gray-750 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${source.type === 'video' ? 'bg-red-400' : 'bg-green-400'
                      }`} />
                    <span className="text-white font-medium">{source.name}</span>
                    <span className="text-xs text-gray-400">({source.type})</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-gray-300">Priority:</span>
                    <select
                      value={source.priority}
                      onChange={(e) => onPriorityChange(source.id, parseInt(e.target.value))}
                      className="bg-gray-700 text-white rounded px-3 py-1 text-sm"
                    >
                      <option value={1}>1 (Highest)</option>
                      <option value={2}>2</option>
                      <option value={3}>3</option>
                      <option value={4}>4 (Lowest)</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'hotkeys' && (
            <div className="space-y-4">
              <p className="text-gray-300 text-sm mb-4">
                Configure keyboard shortcuts for quick media control.
              </p>
              {defaultHotkeys.map(hotkey => (
                <div key={hotkey.id} className="flex items-center justify-between p-4 bg-gray-750 rounded-lg">
                  <div>
                    <div className="text-white font-medium">{hotkey.action}</div>
                    <div className="text-sm text-gray-400">{hotkey.description}</div>
                  </div>
                  <div className="bg-gray-700 px-3 py-1 rounded text-white text-sm font-mono">
                    {hotkey.key}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'general' && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-750 rounded-lg">
                <label className="flex items-center space-x-3">
                  <input type="checkbox" className="rounded" defaultChecked />
                  <span className="text-white">Enable system tray icon</span>
                </label>
                <p className="text-sm text-gray-400 mt-1">Show MediaSense status in system tray</p>
              </div>

              <div className="p-4 bg-gray-750 rounded-lg">
                <label className="flex items-center space-x-3">
                  <input type="checkbox" className="rounded" defaultChecked />
                  <span className="text-white">Auto-pause on focus loss</span>
                </label>
                <p className="text-sm text-gray-400 mt-1">Pause media when switching away from the application</p>
              </div>

              <div className="p-4 bg-gray-750 rounded-lg">
                <label className="flex items-center space-x-3">
                  <input type="checkbox" className="rounded" />
                  <span className="text-white">Show floating overlay</span>
                </label>
                <p className="text-sm text-gray-400 mt-1">Display current playback status in a floating window</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};