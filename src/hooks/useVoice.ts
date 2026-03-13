import { useState, useCallback, useRef, useEffect } from 'react';

interface UseVoiceReturn {
  isListening: boolean;
  transcript: string;
  error: string | null;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
  hasSupport: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SpeechRecognitionAny = any;

export function useVoice(): UseVoiceReturn {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [hasSupport, setHasSupport] = useState(true);
  
  const recognitionRef = useRef<SpeechRecognitionAny | null>(null);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setHasSupport(false);
      setError('Seu navegador não suporta reconhecimento de voz');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'pt-BR';

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        }
      }

      if (finalTranscript) {
        setTranscript(prev => prev + ' ' + finalTranscript.trim());
      }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onerror = (event: any) => {
      setError(`Erro: ${event.error}`);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start();
      } catch (err) {
        setError('Erro ao iniciar reconhecimento de voz');
      }
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  }, [isListening]);

  const resetTranscript = useCallback(() => {
    setTranscript('');
  }, []);

  return {
    isListening,
    transcript,
    error,
    startListening,
    stopListening,
    resetTranscript,
    hasSupport
  };
}

// Parser de comandos de voz
export function parseVoiceCommand(transcript: string): { action: string; params: Record<string, string> } | null {
  const lowerTranscript = transcript.toLowerCase();
  
  // Comando para criar treino
  if (lowerTranscript.includes('criar treino') || lowerTranscript.includes('novo treino')) {
    const goalMatch = lowerTranscript.match(/(hipertrofia|emagrecimento|resistência|condicionamento)/);
    const daysMatch = lowerTranscript.match(/(\d+)\s*dias?/);
    const nameMatch = lowerTranscript.match(/para\s+([\w\s]+?)(?:\s+com|\s+de|\s+para|$)/);
    
    return {
      action: 'create_workout',
      params: {
        goal: goalMatch?.[1] || 'hipertrofia',
        days: daysMatch?.[1] || '3',
        clientName: nameMatch?.[1]?.trim() || ''
      }
    };
  }
  
  // Comando para criar dieta
  if (lowerTranscript.includes('criar dieta') || lowerTranscript.includes('nova dieta')) {
    const goalMatch = lowerTranscript.match(/(hipertrofia|emagrecimento|manutenção)/);
    
    return {
      action: 'create_diet',
      params: {
        goal: goalMatch?.[1] || 'manutenção'
      }
    };
  }
  
  // Comando para enviar mensagem
  if (lowerTranscript.includes('enviar mensagem') || lowerTranscript.includes('nova mensagem')) {
    return {
      action: 'send_message',
      params: {
        content: transcript
      }
    };
  }
  
  // Comando para agendar
  if (lowerTranscript.includes('agendar') || lowerTranscript.includes('marcar treino')) {
    const dateMatch = lowerTranscript.match(/(\d{1,2})\s*de\s*(janeiro|fevereiro|março|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro)/);
    const timeMatch = lowerTranscript.match(/(\d{1,2}):?(\d{2})?\s*(da manhã|da tarde|da noite|am|pm)?/);
    
    return {
      action: 'schedule',
      params: {
        date: dateMatch ? `${dateMatch[1]} de ${dateMatch[2]}` : '',
        time: timeMatch ? timeMatch[0] : ''
      }
    };
  }
  
  return null;
}
