import { useState, useCallback } from 'react';
import type { MediaSource, MediaState } from '../types/media';

const initialSources: MediaSource[] = [
  {
    id: 'youtube',
    name: 'YouTube',
    type: 'video',
    isPlaying: false,
    isPaused: true,
    manuallyPaused: false,
    currentTrack: 'No video selected',
    duration: 0,
    currentTime: 0,
    volume: 80,
    priority: 1
  },
  {
    id: 'spotify',
    name: 'Spotify',
    type: 'music',
    isPlaying: false,
    isPaused: true,
    manuallyPaused: false,
    currentTrack: 'No track selected',
    duration: 0,
    currentTime: 0,
    volume: 75,
    priority: 2
  }
];

export const useMediaManager = () => {
  const [mediaState, setMediaState] = useState<MediaState>({
    sources: initialSources,
    activeSource: null,
    globalPaused: false
  });

  const updateSource = useCallback((sourceId: string, updates: Partial<MediaSource>) => {
    setMediaState(prev => ({
      ...prev,
      sources: prev.sources.map(source =>
        source.id === sourceId ? { ...source, ...updates } : source
      )
    }));
  }, []);

  const playSource = useCallback((sourceId: string) => {
    setMediaState(prev => {
      const source = prev.sources.find(s => s.id === sourceId);
      if (!source) return prev;

      // Find other playing sources and pause them based on priority
      const updatedSources = prev.sources.map(s => {
        if (s.id === sourceId) {
          return { ...s, isPlaying: true, isPaused: false, manuallyPaused: false };
        } else if (s.isPlaying && s.priority > source.priority) {
          // Lower priority sources get automatically paused (not manually)
          return { ...s, isPlaying: false, isPaused: true, manuallyPaused: false };
        }
        return s;
      });

      return {
        ...prev,
        sources: updatedSources,
        activeSource: sourceId,
        globalPaused: false
      };
    });
  }, []);

  const pauseSource = useCallback((sourceId: string) => {
    setMediaState(prev => {
      const currentSource = prev.sources.find(s => s.id === sourceId);
      if (!currentSource) return prev;

      // Mark this source as manually paused
      const updatedSources = prev.sources.map(s =>
        s.id === sourceId
          ? { ...s, isPlaying: false, isPaused: true, manuallyPaused: true }
          : s
      );

      // Only resume other sources if the paused source was the currently active one
      // AND it was the highest priority playing source
      if (currentSource.isPlaying && prev.activeSource === sourceId) {
        // Find the highest priority paused source that has content to resume
        // BUT only resume sources that were NOT manually paused
        const sourcesToResume = updatedSources
          .filter(s =>
            s.id !== sourceId &&
            s.isPaused &&
            !s.manuallyPaused && // Only resume automatically paused sources
            s.currentTrack !== `No ${s.type === 'video' ? 'video' : 'track'} selected` &&
            s.currentTrack !== 'No video selected' &&
            s.currentTrack !== 'No track selected'
          )
          .sort((a, b) => a.priority - b.priority);

        if (sourcesToResume.length > 0) {
          const resumeSource = sourcesToResume[0];
          updatedSources.forEach(s => {
            if (s.id === resumeSource.id) {
              s.isPlaying = true;
              s.isPaused = false;
              s.manuallyPaused = false;
            }
          });
        }
      }

      const activeSource = updatedSources.find(s => s.isPlaying)?.id || null;

      return {
        ...prev,
        sources: updatedSources,
        activeSource
      };
    });
  }, []);

  const togglePlayPause = useCallback((sourceId: string) => {
    const source = mediaState.sources.find(s => s.id === sourceId);
    if (!source) return;

    if (source.isPlaying) {
      pauseSource(sourceId);
    } else {
      playSource(sourceId);
    }
  }, [mediaState.sources, playSource, pauseSource]);

  const setVolume = useCallback((sourceId: string, volume: number) => {
    updateSource(sourceId, { volume });
  }, [updateSource]);

  const setPriority = useCallback((sourceId: string, priority: number) => {
    updateSource(sourceId, { priority });
  }, [updateSource]);

  return {
    mediaState,
    playSource,
    pauseSource,
    togglePlayPause,
    setVolume,
    setPriority,
    updateSource
  };
};