import { useState } from 'react';
import { Music, Play, Pause, SkipForward, SkipBack, Volume2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

interface MusicPlayerProps {
  isOpen: boolean;
  onClose: () => void;
}

const TRACKS = [
  { id: 1, title: 'Workout Mix 2024', artist: 'Fitness Beats', duration: 180 },
  { id: 2, title: 'Electronic Energy', artist: 'DJ Fit', duration: 240 },
  { id: 3, title: 'Hip Hop Power', artist: 'Street Workout', duration: 200 },
  { id: 4, title: 'Running Beats', artist: 'Cardio Mix', duration: 220 },
  { id: 5, title: 'Gym Anthem', artist: 'Motivation Crew', duration: 190 }
];

export function MusicPlayer({ isOpen, onClose }: MusicPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [volume, setVolume] = useState(70);
  const [progress, setProgress] = useState(0);

  const track = TRACKS[currentTrack];

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const nextTrack = () => {
    setCurrentTrack((prev) => (prev + 1) % TRACKS.length);
    setProgress(0);
  };

  const prevTrack = () => {
    setCurrentTrack((prev) => (prev - 1 + TRACKS.length) % TRACKS.length);
    setProgress(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#111118] border-t border-red-500/30 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Track Info */}
          <div className="flex items-center gap-4 flex-1">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center pulse-red">
              <Music className="w-6 h-6 text-white" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-white font-medium">{track.title}</p>
              <p className="text-sm text-gray-500">{track.artist}</p>
            </div>
            {/* Visualizer */}
            {isPlaying && (
              <div className="hidden sm:flex items-end gap-1 h-8 ml-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <span 
                    key={i} 
                    className="w-1 bg-red-500 rounded-full"
                    style={{ 
                      height: `${Math.random() * 20 + 10}px`,
                      animation: `wave 0.5s ease-in-out infinite`,
                      animationDelay: `${i * 0.1}s`
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={prevTrack}
              className="text-gray-400 hover:text-white"
            >
              <SkipBack className="w-5 h-5" strokeWidth={1.5} />
            </Button>
            
            <Button 
              onClick={togglePlay}
              className="w-12 h-12 rounded-full bg-red-500 hover:bg-red-600 text-white"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5" strokeWidth={1.5} />
              ) : (
                <Play className="w-5 h-5 ml-0.5" strokeWidth={1.5} />
              )}
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm"
              onClick={nextTrack}
              className="text-gray-400 hover:text-white"
            >
              <SkipForward className="w-5 h-5" strokeWidth={1.5} />
            </Button>
          </div>

          {/* Volume & Close */}
          <div className="flex items-center gap-4 flex-1 justify-end">
            <div className="hidden sm:flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-gray-500" strokeWidth={1.5} />
              <Slider
                value={[volume]}
                onValueChange={(v) => setVolume(v[0])}
                max={100}
                step={1}
                className="w-24"
              />
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-red-400"
            >
              <X className="w-5 h-5" strokeWidth={1.5} />
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-3 flex items-center gap-3">
          <span className="text-xs text-gray-500">{formatTime(progress)}</span>
          <div className="flex-1 h-1 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-red-500 transition-all"
              style={{ width: `${(progress / track.duration) * 100}%` }}
            />
          </div>
          <span className="text-xs text-gray-500">{formatTime(track.duration)}</span>
        </div>
      </div>
    </div>
  );
}
