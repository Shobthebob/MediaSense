export interface MediaSource {
  id: string;
  name: string;
  type: 'video' | 'music';
  isPlaying: boolean;
  isPaused: boolean;
  manuallyPaused?: boolean; // Track if user manually paused this source
  currentTrack?: string;
  duration?: number;
  currentTime?: number;
  volume: number;
  priority: number;
}

export interface MediaState {
  sources: MediaSource[];
  activeSource: string | null;
  globalPaused: boolean;
}

export interface HotKey {
  id: string;
  key: string;
  action: string;
  description: string;
}