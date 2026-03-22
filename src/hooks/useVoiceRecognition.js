import { useState, useCallback } from 'react';

const useVoiceRecognition = (onCommand, onResult) => {
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState(null);

  const startListening = useCallback(() => {
    setSpeechError(null);
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechError('Tu navegador no soporta el reconocimiento de voz. Usa Chrome o Safari.');
      alert('Tu navegador no soporta la API de reconocimiento de voz.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'es-ES';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      recognition.continuous = false; // Add explicit continuous false

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
        if (event.error === 'not-allowed') {
          setSpeechError('Permiso de micrófono denegado. Por favor concédelo en tu navegador.');
        } else {
          setSpeechError(`Error al reconocer voz: ${event.error}`);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        console.log('Dictado por voz finalizado.');
      };

      recognition.start();
    } catch (e) {
      console.error('Fallo al inicializar Speech API', e);
      setSpeechError('Ocurrió un problema al iniciar el micrófono.');
    }
  }, [onCommand, onResult]);

  return { isListening, startListening, speechError };
};

export default useVoiceRecognition;
