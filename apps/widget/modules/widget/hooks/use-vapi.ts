import Vapi from '@vapi-ai/web';
import { useEffect, useState } from 'react';

interface TranscriptMessage {
  role: 'user' | 'assistant';
  text: string;
}

export const useVapi = () => {
  const [vapi, setVapi] = useState<Vapi | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptMessage[]>([]);

  useEffect(() => {
    // Only for testing the Vapi API, otherwide customers will provide their own API keys
    const vapiInstance = new Vapi('b7572783-5189-41f8-b82c-3aac5ca9c8c9');
    setVapi(vapiInstance);

    vapiInstance.on('call-start', () => {
      setIsConnected(true);
      setIsConnecting(false);
      setTranscript([]);
    });

    vapiInstance.on('call-end', () => {
      setIsConnected(false);
      setIsConnecting(false);
      setIsSpeaking(false);
    });

    vapiInstance.on('speech-start', () => {
      setIsSpeaking(true);
    });

    vapiInstance.on('speech-end', () => {
      setIsSpeaking(false);
    });

    vapiInstance.on('error', (error) => {
      console.error(error, 'VAPI_ERROR');
      setIsConnecting(false);
    });

    vapiInstance.on('message', (message) => {
      if (message.type === 'transcript' && message.transcriptType === 'final') {
        setTranscript((prev) => [
          ...prev,
          {
            role: message.role === 'user' ? 'user' : 'assistant',
            text: message.transcript,
          },
        ]);
      }
    });

    return () => {
      vapiInstance?.stop();
    };
  }, []);

  const startCall = () => {
    setIsConnecting(true);

    // Only for testing the Vapi API, otherwide customers will provide their own Assistant IDs
    if (vapi) vapi.start('39007052-a8f7-4902-8c8c-749187b99e0f');
  };

  const endCall = () => {
    if (vapi) vapi.stop();
  };

  return {
    isSpeaking,
    isConnecting,
    isConnected,
    transcript,
    startCall,
    endCall,
  };
};
