
import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function VoiceAssistant() {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = async (event: any) => {
        const text = event.results[0][0].transcript;
        setTranscript(text);
        setIsListening(false);
        await processVoiceInput(text);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        toast.error('Voice recognition failed. Please try again.');
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    synthRef.current = window.speechSynthesis;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  const processVoiceInput = async (text: string) => {
    setIsProcessing(true);
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer sk-proj-8kCs_DagrhCF2f2Ad7GwQxwhaAPPmGvBW7P9tOpideSD_',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful voice assistant for OnePoint ALO. Provide concise, friendly responses. Keep answers under 50 words for voice output.',
            },
            { role: 'user', content: text },
          ],
          max_tokens: 150,
          temperature: 0.7,
        }),
      });

      if (!response.ok) throw new Error('Failed to get AI response');

      const data = await response.json();
      const aiResponse = data.choices[0].message.content;

      // Speak the response
      if (synthRef.current) {
        const utterance = new SpeechSynthesisUtterance(aiResponse);
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.volume = 1;
        synthRef.current.speak(utterance);
      }

      toast.success('Voice assistant responded');
    } catch (error) {
      console.error('Voice processing error:', error);
      toast.error('Failed to process voice input');
    } finally {
      setIsProcessing(false);
      setTranscript('');
    }
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      toast.error('Voice recognition not supported in this browser');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        toast.info('Listening... Speak now');
      } catch (error) {
        console.error('Failed to start recognition:', error);
        toast.error('Failed to start voice recognition');
      }
    }
  };

  return (
    <>
      <button
        onClick={toggleListening}
        disabled={isProcessing}
        className={`fixed bottom-24 right-6 w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 z-50 ${
          isListening
            ? 'bg-gradient-to-br from-accent to-primary animate-pulse scale-110'
            : isProcessing
            ? 'bg-gradient-to-br from-primary/50 to-accent/50'
            : 'bg-gradient-to-br from-primary to-accent hover:scale-110'
        }`}
        style={{
          boxShadow: isListening
            ? '0 0 40px rgba(167, 139, 250, 0.6), 0 0 80px rgba(167, 139, 250, 0.3)'
            : '0 8px 32px rgba(0, 0, 0, 0.4)',
        }}
      >
        {isProcessing ? (
          <Loader2 className="w-8 h-8 text-white animate-spin" />
        ) : isListening ? (
          <MicOff className="w-8 h-8 text-white" />
        ) : (
          <Mic className="w-8 h-8 text-white" />
        )}
      </button>

      {transcript && (
        <div className="fixed bottom-44 right-6 glass-card rounded-2xl p-3 max-w-xs z-50 animate-in slide-in-from-bottom">
          <p className="text-sm text-foreground">{transcript}</p>
        </div>
      )}
    </>
  );
}