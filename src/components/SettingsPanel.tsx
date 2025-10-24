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

  const tabs = [
    { id: 'priorities', label: 'Priorities', icon: Layers },
    { id: 'hotkeys', label: 'Hotkeys', icon: Keyboard },
    { id: 'general', label: 'General', icon: Volume2 }
  ];

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Overlay */}
      <div
        className="flex-1 bg-primary/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="bg-secondary border-l border-muted w-96 overflow-y-auto">
        {/* Header */}
        <div className="border-b border-muted p-6">
          <div className="flex-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-tertiary rounded-lg border border-accent/30">
                <Settings className="w-5 h-5 text-accent" />
              </div>
              <h2 className="text-title text-primary">Settings</h2>
            </div>
            <button
              onClick={onClose}
              className="btn btn-ghost btn-icon"
              aria-label="Close settings"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-muted">
          <div className="flex">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-4 px-3 transition-colors ${activeTab === tab.id
                      ? 'border-b-2 border-accent text-accent bg-tertiary/50'
                      : 'text-secondary hover:text-primary hover:bg-surface'
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-caption font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'priorities' && (
            <div className="stack">
              <div className="card bg-elevated border-accent/20">
                <p className="text-body text-secondary leading-relaxed">
                  <strong className="text-accent">Lower numbers</strong> have higher priority.
                  When a higher priority source starts playing, lower priority sources will be
                  <strong className="text-warning"> paused automatically</strong>.
                </p>
              </div>
              {sources.map(source => (
                <div key={source.id} className="card">
                  <div className="flex-between">
                    <div className="flex items-center gap-3">
                      <div className={`status-indicator ${source.type === 'video' ? 'status-playing' : 'status-paused'}`}></div>
                      <div>
                        <span className="text-body font-medium text-primary">{source.name}</span>
                        <p className="text-caption text-tertiary">({source.type})</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-caption font-medium text-secondary">Priority:</span>
                      <select
                        value={source.priority}
                        onChange={(e) => onPriorityChange(source.id, parseInt(e.target.value))}
                        className="select"
                      >
                        <option value={1}>1 (Highest)</option>
                        <option value={2}>2</option>
                        <option value={3}>3</option>
                        <option value={4}>4 (Lowest)</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'hotkeys' && (
            <div className="stack">
              <div className="card bg-elevated border-accent/20">
                <p className="text-body text-secondary leading-relaxed">
                  Configure <strong className="text-accent">keyboard shortcuts</strong> for quick media control.
                </p>
              </div>
              {defaultHotkeys.map(hotkey => (
                <div key={hotkey.id} className="card">
                  <div className="flex-between">
                    <div>
                      <h4 className="text-body font-medium text-primary mb-1">{hotkey.action}</h4>
                      <p className="text-caption text-secondary">{hotkey.description}</p>
                    </div>
                    <div className="surface px-3 py-2 rounded-lg border border-accent/30">
                      <span className="text-caption text-accent font-mono font-medium">
                        {hotkey.key}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'general' && (
            <div className="stack">
              <div className="card">
                <label className="flex items-center gap-4 cursor-pointer">
                  <input type="checkbox" className="checkbox" defaultChecked />
                  <div>
                    <span className="text-body font-medium text-primary">Enable system tray icon</span>
                    <p className="text-caption text-secondary mt-1">Show MediaSense status in system tray</p>
                  </div>
                </label>
              </div>

              <div className="card">
                <label className="flex items-center gap-4 cursor-pointer">
                  <input type="checkbox" className="checkbox" defaultChecked />
                  <div>
                    <span className="text-body font-medium text-primary">Auto-start with system</span>
                    <p className="text-caption text-secondary mt-1">Launch MediaSense when computer starts</p>
                  </div>
                </label>
              </div>

              <div className="card">
                <label className="flex items-center gap-4 cursor-pointer">
                  <input type="checkbox" className="checkbox" />
                  <div>
                    <span className="text-body font-medium text-primary">Show notifications</span>
                    <p className="text-caption text-secondary mt-1">Display alerts when media sources change</p>
                  </div>
                </label>
              </div>

              <div className="card">
                <div className="mb-4">
                  <label className="text-body font-medium text-primary mb-2 block">
                    Detection interval
                  </label>
                  <p className="text-caption text-secondary mb-3">
                    How often to check for new media sources (in seconds)
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    defaultValue="3"
                    className="slider flex-1"
                  />
                  <span className="text-caption text-muted font-mono w-8 text-right">3s</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
