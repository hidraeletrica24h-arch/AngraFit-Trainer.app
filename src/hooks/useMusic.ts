import { useState, useCallback, useEffect } from 'react';

interface Track {
  id: string;
  title: string;
  artist: string;
  url: string;
  genre: 'workout' | 'eletronica' | 'hiphop';
}

const SAMPLE_TRACKS: Track[] = [
  { id: '1', title: 'Workout Mix 1', artist: 'Fitness Beats', url: '', genre: 'workout' },
  { id: '2', title: 'Power Training', artist: 'Gym Music', url: '', genre: 'workout' },
  { id: '3', title: 'Electronic Energy', artist: 'DJ Fit', url: '', genre: 'eletronica' },
  { id: '4', title: 'Running Beats', artist: 'Cardio Mix', url: '', genre: 'eletronica' },
  { id: '5', title: 'Hip Hop Power', artist: 'Street Workout', url: '', genre: 'hiphop' },
  { id: '6', title: 'Gym Anthem', artist: 'Motivation Crew', url: '', genre: 'hiphop' }
];

interface UseMusicReturn {
  isPlaying: boolean;
  currentTrack: Track | null;
  currentTime: number;
  volume: number;
  tracks: Track[];
  currentGenre: string;
  play: () => void;
  pause: () => void;
  next: () => void;
  previous: () => void;
  setVolume: (volume: number) => void;
  selectTrack: (track: Track) => void;
  selectGenre: (genre: string) => void;
  filteredTracks: Track[];
}

export function useMusic(): UseMusicReturn {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolumeState] = useState(70);
  const [currentGenre, setCurrentGenre] = useState<string>('all');
  
  const currentTrackIndex = { current: 0 };

  const filteredTracks = currentGenre === 'all' 
    ? SAMPLE_TRACKS 
    : SAMPLE_TRACKS.filter(t => t.genre === currentGenre);

  useEffect(() => {
    const interval = setInterval(() => {
      if (isPlaying) {
        setCurrentTime(prev => {
          if (prev >= 180) {
            return 0;
          }
          return prev + 1;
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying]);

  const play = useCallback(() => {
    if (!currentTrack && filteredTracks.length > 0) {
      setCurrentTrack(filteredTracks[0]);
      currentTrackIndex.current = 0;
    }
    setIsPlaying(true);
  }, [currentTrack, filteredTracks]);

  const pause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const next = useCallback(() => {
    if (filteredTracks.length === 0) return;
    
    const nextIndex = (currentTrackIndex.current + 1) % filteredTracks.length;
    currentTrackIndex.current = nextIndex;
    setCurrentTrack(filteredTracks[nextIndex]);
    setCurrentTime(0);
    setIsPlaying(true);
  }, [filteredTracks]);

  const previous = useCallback(() => {
    if (filteredTracks.length === 0) return;
    
    const prevIndex = currentTrackIndex.current === 0 
      ? filteredTracks.length - 1 
      : currentTrackIndex.current - 1;
    currentTrackIndex.current = prevIndex;
    setCurrentTrack(filteredTracks[prevIndex]);
    setCurrentTime(0);
    setIsPlaying(true);
  }, [filteredTracks]);

  const setVolume = useCallback((newVolume: number) => {
    setVolumeState(Math.max(0, Math.min(100, newVolume)));
  }, []);

  const selectTrack = useCallback((track: Track) => {
    setCurrentTrack(track);
    currentTrackIndex.current = filteredTracks.findIndex(t => t.id === track.id);
    setCurrentTime(0);
    setIsPlaying(true);
  }, [filteredTracks]);

  const selectGenre = useCallback((genre: string) => {
    setCurrentGenre(genre);
    setCurrentTrack(null);
    setCurrentTime(0);
    setIsPlaying(false);
    currentTrackIndex.current = 0;
  }, []);

  return {
    isPlaying,
    currentTrack,
    currentTime,
    volume,
    tracks: SAMPLE_TRACKS,
    currentGenre,
    play,
    pause,
    next,
    previous,
    setVolume,
    selectTrack,
    selectGenre,
    filteredTracks
  };
}
