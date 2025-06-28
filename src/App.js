import React, { useState, useEffect, useCallback } from 'react';
import './App.css'; 
// import initialPictograms from './data/pictograms'; // Ya no importamos los datos iniciales locales
import PictogramGrid from './components/PictogramGrid';
import AddPictogramForm from './components/AddPictogramForm';
import Pictogram from './components/Pictogram';

const LOCAL_STORAGE_KEY = 'pictogramApp.pictograms'; // Clave para el almacenamiento local
const ARASAAC_API_BASE_URL = 'https://api.arasaac.org/api'; // URL base de la API de ARASAAC

function App() {
  const [allPictograms, setAllPictograms] = useState([]);
  const [selectedPictograms, setSelectedPictograms] = useState([]);
  const [loading, setLoading] = useState(false); // Inicialmente no estamos cargando
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState(''); // Estado para el término de búsqueda
  const [isListening, setIsListening] = useState(false); // Estado para el dictado por voz

  const [appMode, setAppMode] = useState('phraseBuilder'); // 'phraseBuilder' o 'shoppingList'
  const [shoppingListItems, setShoppingListItems] = useState([]); // Estado para la lista de la compra

  // Efecto para cargar los pictogramas desde la API basado en el término de búsqueda
  useEffect(() => {
    const fetchPictograms = async () => {
      if (!searchTerm || appMode !== 'phraseBuilder') {
        setAllPictograms([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        // Dividir la frase en palabras (puedes ajustar la lógica de división según necesites)
        const words = searchTerm.trim().split(/\s+/);
        const results = [];

        for (const word of words) {
          if (word) { // Asegurarse de que la palabra no esté vacía
            // Buscar pictogramas para cada palabra
            const response = await fetch(`${ARASAAC_API_BASE_URL}/pictograms/es/search/${encodeURIComponent(word)}`);
            if (!response.ok) {
              console.warn(`No se encontraron pictogramas para la palabra: "${word}"`);
              // Si no se encuentra un pictograma para la palabra, puedes añadir un marcador de posición
              results.push({ id: `text-${word}`, text: word, imageUrl: '' }); // Marcador de posición de texto
              continue; // Pasar a la siguiente palabra
            }
            const data = await response.json();
            if (data && data.length > 0) {
              // Tomar el primer resultado como el pictograma para la palabra
              const item = data[0];
              results.push({
                id: item._id,
                text: item.keywords[0]?.keyword || word, // Usar la palabra original si no hay palabra clave
                imageUrl: `${ARASAAC_API_BASE_URL}/pictograms/${item._id}`
              });
            } else {
               console.warn(`No se encontraron pictogramas para la palabra: "${word}"`);
               results.push({ id: `text-${word}`, text: word, imageUrl: '' }); // Marcador de posición de texto
            }
          }
        }

        setAllPictograms(results); // Establecer los resultados en el estado
        setLoading(false);

      } catch (error) {
        setError(error);
        setLoading(false);
        console.error("Error fetching pictograms:", error);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      fetchPictograms();
    }, 500);

    return () => clearTimeout(delayDebounceFn); // Limpiar el timeout si el componente se desmonta o el término de búsqueda cambia

  }, [searchTerm, appMode]); // Se ejecuta si cambia el término de búsqueda o el modo de la app

  // Efecto para cargar pictogramas guardados localmente al iniciar (opcional)
  useEffect(() => {
    const savedPictograms = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedPictograms) {
      // setAllPictograms(JSON.parse(savedPictograms)); // Descomentar si quieres cargar también los guardados localmente al inicio
    }
  }, []);

  // Efecto para guardar los pictogramas en localStorage (si quieres guardar los resultados de la búsqueda o los añadidos manualmente)
  useEffect(() => {
    if (allPictograms.length > 0 && !error) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(allPictograms));
    }
  }, [allPictograms, error]);

  // Función para buscar un único pictograma y devolver sus datos
  const fetchSinglePictogram = useCallback(async (word) => {
    if (!word) return null;
    try {
      const response = await fetch(`${ARASAAC_API_BASE_URL}/pictograms/es/search/${encodeURIComponent(word)}`);
      const data = response.ok ? await response.json() : [];
      if (data.length > 0) {
        const item = data[0];
        return {
          id: item._id,
          text: item.keywords[0]?.keyword || word,
          imageUrl: `${ARASAAC_API_BASE_URL}/pictograms/${item._id}`,
        };
      } else {
        console.warn(`No se encontraron pictogramas para: "${word}"`);
        return { id: `text-${word}`, text: word, imageUrl: '' };
      }
    } catch (err) {
      console.error("Error fetching single pictogram:", err);
      setError(err);
      return { id: `text-${word}`, text: word, imageUrl: '' };
    }
  }, []);

  // Función para añadir un artículo a la lista de la compra
  const addItemToShoppingList = useCallback(async (text) => {
    if (!text) return;
    setLoading(true);
    const newItemData = await fetchSinglePictogram(text);
    if (newItemData) {
      // Usamos una función para asegurar que el ID es único en la lista
      const uniqueId = `${newItemData.id}-${Date.now()}`;
      setShoppingListItems(prevItems => [...prevItems, { ...newItemData, id: uniqueId, checked: false }]);
    }
    setLoading(false);
    setSearchTerm(''); // Limpiar el input después de añadir
  }, [fetchSinglePictogram]);

  // Función para iniciar el reconocimiento de voz
  const startListening = () => {
    // Usar SpeechRecognition estándar si está disponible, de lo contrario usar webkitSpeechRecognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Tu navegador no soporta la API de reconocimiento de voz.');
      return;
    }

    // Nota: En dispositivos móviles, el dictado por voz a menudo requiere un contexto seguro (HTTPS).
    // Asegúrate de servir la aplicación a través de HTTPS para que esta función opere en smartphones.

    const recognition = new SpeechRecognition();
    recognition.lang = 'es-ES'; // Establecer el idioma a español
    recognition.interimResults = false; // No obtener resultados intermedios
    recognition.maxAlternatives = 1; // Obtener solo la mejor alternativa

    recognition.onstart = () => {
      setIsListening(true);
      console.log('Dictado por voz iniciado...');
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      console.log('Texto reconocido:', transcript);
      const command = transcript.toLowerCase().trim();

      if (command === 'lista de la compra') {
        setAppMode('shoppingList');
        setSearchTerm('');
        setAllPictograms([]);
      } else if (command === 'modo frase') {
        setAppMode('phraseBuilder');
        setSearchTerm('');
      } else if (appMode === 'shoppingList') {
        addItemToShoppingList(transcript);
      } else {
        setSearchTerm(transcript); // Actualizar el término de búsqueda con el texto reconocido
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
  };

  // Manejar la entrada de texto para detectar comandos o añadir a la lista
  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter') {
      const command = searchTerm.toLowerCase().trim();
      if (command === 'lista de la compra') {
        setAppMode('shoppingList');
        setSearchTerm('');
        setAllPictograms([]);
      } else if (command === 'modo frase') {
        setAppMode('phraseBuilder');
        setSearchTerm('');
      } else if (appMode === 'shoppingList') {
        addItemToShoppingList(searchTerm);
      }
    }
  };

  const handlePictogramSelect = (pictogram) => {
    setSelectedPictograms([...selectedPictograms, pictogram]);
  };

  const handleRemovePictogram = (index) => {
    setSelectedPictograms(selectedPictograms.filter((_, i) => i !== index));
  };

  const handleClearPhrase = () => {
    setSelectedPictograms([]);
  };

  const handleRemoveLastPictogram = () => {
    setSelectedPictograms(selectedPictograms.slice(0, -1));
  };

  const speakPhrase = () => {
    const phraseText = selectedPictograms.map(pictogram => pictogram.text).join(' ');
    if (phraseText) {
      const utterance = new SpeechSynthesisUtterance(phraseText);
      utterance.lang = 'es-ES';
      window.speechSynthesis.speak(utterance);
    }
  };

  // Función para descargar las imágenes de los pictogramas seleccionados
  const handleDownloadPhraseImages = () => {
    selectedPictograms.forEach((pictogram, index) => {
      // Crear un enlace temporal
      const link = document.createElement('a');
      link.href = pictogram.imageUrl;
      // Establecer el nombre del archivo (puedes mejorarlo)
      link.download = `pictograma_${index + 1}.png`; // Nombre de archivo simple
      // Simular un clic en el enlace para iniciar la descarga
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  };

  // Función para añadir todos los pictogramas mostrados a la frase seleccionada
  const handleAddAllToPhrase = () => {
    setSelectedPictograms([...selectedPictograms, ...allPictograms]);
  };

  // Función para añadir un nuevo pictograma (ahora se añade a la lista actual y se guarda localmente)
  const handleAddPictogram = (newPictogram) => {
    setAllPictograms([...allPictograms, newPictogram]);
  };

  // Funciones para la lista de la compra
  const handleToggleShoppingItem = (itemId) => {
    setShoppingListItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const handleClearShoppingList = () => {
    setShoppingListItems([]);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Mi VOZ</h1>
      </header>
      <div className="main-content">
        <div className="pictogram-selection">
          {/* Campo de búsqueda y dictado (compartido) */}
          <div className="search-bar" style={{ marginBottom: '20px' }}>
            <input
              type="text"
              placeholder={appMode === 'shoppingList' ? 'Añadir artículo y pulsar Enter...' : 'Buscar pictogramas...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleInputKeyDown}
              style={{ padding: '10px', fontSize: '1em', width: '80%', marginRight: '10px' }}
            />
            <button onClick={startListening} disabled={isListening} style={{ padding: '10px', fontSize: '1em', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ fontSize: '1.5em' }}>{isListening ? '...' : '🎤'}</div> {/* Icono de micrófono o puntos suspensivos */}
              <div>{isListening ? 'Escuchando...' : 'Dictar'}</div> {/* Texto debajo */}
            </button>
          </div>

          {appMode === 'phraseBuilder' ? (
            <>
              {/* Botón para añadir todos los pictogramas a la frase */}
              {!loading && !error && allPictograms.length > 0 && (
                <button onClick={handleAddAllToPhrase} style={{ marginBottom: '10px', padding: '10px 15px', fontSize: '1em' }}>
                  Añadir todos a la frase
                </button>
              )}

              {loading && <p>Cargando pictogramas...</p>}
              {error && <p>Error al cargar pictogramas: {error.message}</p>}
              {!loading && !error && allPictograms.length === 0 && searchTerm && (
                <p>No se encontraron pictogramas para "{searchTerm}".</p>
              )}
              {!loading && !error && allPictograms.length > 0 && (
                <PictogramGrid
                  pictograms={allPictograms}
                  onPictogramSelect={handlePictogramSelect}
                />
              )}
              {!loading && !error && !searchTerm && (
                <p>Introduce un término de búsqueda o usa el dictado por voz.</p>
              )}
            </>
          ) : (
            <div className="shopping-list-view">
              <h2>Lista de la Compra</h2>
              {loading && <p>Añadiendo artículo...</p>}
              <ul className="shopping-list">
                {shoppingListItems.map((item) => (
                  <li key={item.id} className={`shopping-list-item ${item.checked ? 'checked' : ''}`}>
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={() => handleToggleShoppingItem(item.id)}
                    />
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.text} className="shopping-item-picto" />
                    ) : (
                      <span className="shopping-item-picto-placeholder"></span>
                    )}
                    <span>{item.text}</span>
                  </li>
                ))}
              </ul>
              {shoppingListItems.length > 0 && (
                <button onClick={handleClearShoppingList}>Borrar Lista</button>
              )}
              {shoppingListItems.length === 0 && !loading && (
                <p>La lista está vacía. Añade artículos usando el campo de arriba.</p>
              )}
            </div>
          )}
        </div>
        {appMode === 'phraseBuilder' && (
          <div className="selected-phrase">
            <h2>Frase Seleccionada:</h2>
            <div className="selected-pictograms-container" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {selectedPictograms.map((pictogram, index) => (
                <Pictogram
                  key={`${pictogram.id}-${index}`}
                  imageUrl={pictogram.imageUrl}
                  text={pictogram.text}
                  onSelect={() => handleRemovePictogram(index)}
                />
              ))}
            </div>
            {selectedPictograms.length > 0 && (
              <>
                <button onClick={speakPhrase} style={{ marginLeft: '10px', padding: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ fontSize: '2em' }}>▶</div> {/* Icono de Play grande */}
                  <div>Leer Frase</div> {/* Texto debajo del icono */}
                </button>
                <button onClick={handleDownloadPhraseImages} style={{ marginLeft: '5px', padding: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ fontSize: '1.5em' }}>⬇️</div> {/* Icono de descarga */}
                  <div>Descargar Imágenes</div> {/* Texto debajo */}
                </button>
                <button onClick={handleRemoveLastPictogram} style={{ marginLeft: '5px', padding: '5px 10px' }}>
                  Eliminar Último
                </button>
                <button onClick={handleClearPhrase} style={{ marginLeft: '5px', padding: '5px 10px' }}>
                  Borrar Frase
                </button>
              </>
            )}
          </div>
        )}
        {/* Añadimos el formulario para añadir pictogramas */}
        {/* <AddPictogramForm onAddPictogram={handleAddPictogram} /> */}
      </div>
    </div>
  );
}

export default App;
