import { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, X, Radio } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

interface MusicPlayerProps {
  isOpen: boolean;
  onClose: () => void;
}

const TRACKS = [
  { id: 1, title: 'Energy Fitness', artist: 'NRJ Workout', url: 'https://cdn.nrjaudio.fm/adwz2/de/33005/mp3_128.mp3' },
  { id: 2, title: 'Dance Wave!', artist: 'Dance & EDM', url: 'https://dancewave.online/dance.mp3' },
  { id: 3, title: 'Ibiza Global Radio', artist: 'House & Techno', url: 'https://listensync.macast.net/ibiza' },
  { id: 4, title: 'Radio Record Workout', artist: 'Fitness Beats', url: 'https://radiorecord.hostingradio.ru/rr_main96.aacp' },
  { id: 5, title: 'Deep House Lounge', artist: 'Deep & Soulful', url: 'https://19993.live.streamtheworld.com/DEEP_HOUSE_LOUNGE_S01.mp3' }
];

export function MusicPlayer({ isOpen, onClose }: MusicPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [volume, setVolume] = useState(70);
  const [isLoading, setIsLoading] = useState(false);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const track = TRACKS[currentTrack];

  // Instancia/Controle do Áudio
  useEffect(() => {
    if (!audioRef.current) {
      const audioUrl = new Audio();
      audioUrl.crossOrigin = "anonymous";
      audioRef.current = audioUrl;
      audioRef.current.volume = volume / 100;
      
      audioRef.current.addEventListener('waiting', () => setIsLoading(true));
      audioRef.current.addEventListener('playing', () => {
        setIsLoading(false);
        setErrorStatus(null);
      });
      audioRef.current.addEventListener('error', (e) => {
        console.error("Audio stream error:", e);
        setIsLoading(false);
        setErrorStatus('Erro: Stream indisponível ou bloqueado (CORS)');
        setIsPlaying(false);
      });
    }

    const audio = audioRef.current;
    
    // Troca a fonte e tenta dar play caso isPlaying seja true (ou estivesse tocando antes)
    const wasPlaying = isPlaying;
    audio.src = track.url;
    audio.load();
    setIsLoading(true);
    setErrorStatus(null);
    
    if (wasPlaying) {
      audio.play().catch(e => {
        console.warn("Autoplay impedido pelo navegador:", e);
        setIsPlaying(false);
        setIsLoading(false);
      });
    } else {
        setIsLoading(false);
    }

    return () => {
       // Cleanup occurs only when component unmounts fully, not here or music stops instantly
    };
  }, [currentTrack]); // Omitimos isPlaying e volume para não refazer o load quando mudam

  // Efeito do Play/Pause independentemente
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.play().catch(e => {
        console.warn("Play impedido:", e);
        setIsPlaying(false);
      });
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  // Sincroniza Volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const nextTrack = () => {
    setIsPlaying(true); // Força tocar a próxima
    setCurrentTrack((prev) => (prev + 1) % TRACKS.length);
  };

  const prevTrack = () => {
    setIsPlaying(true);
    setCurrentTrack((prev) => (prev - 1 + TRACKS.length) % TRACKS.length);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#111118] border-t border-red-500/30 z-50 animate-slide-up">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Track Info */}
          <div className="flex items-center gap-4 flex-1">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center pulse-red">
              <Radio className="w-6 h-6 text-white" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-white font-medium flex items-center gap-2">
                {track.title}
                {isLoading && <span className="text-xs text-red-400 bg-red-400/10 px-2 rounded-full animate-pulse">Carregando...</span>}
                {errorStatus && <span className="text-xs text-yellow-400 bg-yellow-400/10 px-2 rounded-full">{errorStatus}</span>}
              </p>
              <p className="text-sm text-gray-500">{track.artist}</p>
            </div>
            {/* Visualizer */}
            {(isPlaying && !isLoading) && (
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
      </div>
    </div>
  );
}
