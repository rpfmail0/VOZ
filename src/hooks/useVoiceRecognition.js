import { useState, useCallback } from 'react';

const useVoiceRecognition = (onCommand, onResult) => {
  const [isListening, setIsListening] = useState(false);

  const startListening = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Tu navegador no soporta la API de reconocimiento de voz.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'es-ES';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      console.log('Dictado por voz iniciado...');
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      console.log('Texto reconocido:', transcript);
      const command = transcript.toLowerCase().trim();

      if (command === 'lista de la compra' || command === 'modo frase') {
        onCommand && onCommand(command);
      } else {
        onResult && onResult(transcript);
      }
    };

    recognition.onerror = (event) => {
      console.error('Error en el dictado por voz:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      console.log('Dictado por voz finalizado.');
    };

    recognition.start();
  }, [onCommand, onResult]);

  return { isListening, startListening };
};

export default useVoiceRecognition;
