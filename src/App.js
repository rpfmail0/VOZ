import React, { useState, useCallback, useEffect } from 'react';
import './App.css'; 
import PhraseBuilder from './components/PhraseBuilder';
import ShoppingList from './components/ShoppingList';
import CategorySelector from './components/CategorySelector';
import useVoiceRecognition from './hooks/useVoiceRecognition';
import useArasaac from './hooks/useArasaac';

function App() {
  const [appMode, setAppMode] = useState('phraseBuilder'); // 'phraseBuilder' o 'shoppingList'
  const [searchTerm, setSearchTerm] = useState(''); 
  const [selectedPictograms, setSelectedPictograms] = useState([]);
  const [shoppingListItems, setShoppingListItems] = useState([]);

  // Inicializar guardado de favoritos/frase desde localStorage
  useEffect(() => {
    const saved = localStorage.getItem('pictogramApp.favorites');
    if (saved) {
      try {
        setSelectedPictograms(JSON.parse(saved));
      } catch (e) {
        console.error('Error parsing favorites', e);
      }
    }
    
    const savedShoppingList = localStorage.getItem('pictogramApp.shoppingList');
    if (savedShoppingList) {
      try {
        setShoppingListItems(JSON.parse(savedShoppingList));
      } catch (e) {
        console.error('Error parsing shopping list', e);
      }
    }
  }, []);

  // Guardar favoritos
  useEffect(() => {
    localStorage.setItem('pictogramApp.favorites', JSON.stringify(selectedPictograms));
  }, [selectedPictograms]);

  useEffect(() => {
    localStorage.setItem('pictogramApp.shoppingList', JSON.stringify(shoppingListItems));
  }, [shoppingListItems]);

  // Hook ARASAAC
  const { 
    allPictograms, 
    loading, 
    error, 
    fetchSinglePictogram 
  } = useArasaac(searchTerm, appMode);

  // Comandos de Voz
  const handleVoiceCommand = useCallback((command) => {
    if (command === 'lista de la compra') {
      setAppMode('shoppingList');
      setSearchTerm('');
    } else if (command === 'modo frase') {
      setAppMode('phraseBuilder');
      setSearchTerm('');
    }
  }, []);

  const handleVoiceResult = useCallback((transcript) => {
    if (appMode === 'shoppingList') {
      addItemToShoppingList(transcript);
    } else {
      setSearchTerm(transcript);
    }
  }, [appMode]);

  // Hook Dictado
  const { isListening, startListening } = useVoiceRecognition(handleVoiceCommand, handleVoiceResult);

  // Función para añadir a la lista de la compra
  const addItemToShoppingList = useCallback(async (text) => {
    if (!text) return;
    const newItemData = await fetchSinglePictogram(text);
    if (newItemData) {
      const uniqueId = `${newItemData.id}-${Date.now()}`;
      setShoppingListItems(prev => [...prev, { ...newItemData, id: uniqueId, checked: false }]);
    }
    setSearchTerm('');
  }, [fetchSinglePictogram]);

  // Manejar Input por Teclado
  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter') {
      const command = searchTerm.toLowerCase().trim();
      if (command === 'lista de la compra') {
        setAppMode('shoppingList');
        setSearchTerm('');
      } else if (command === 'modo frase') {
        setAppMode('phraseBuilder');
        setSearchTerm('');
      } else if (appMode === 'shoppingList') {
        addItemToShoppingList(searchTerm);
      }
    }
  };

  // --- Funciones del Modo Frase ---
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

  const handleAddAllToPhrase = () => {
    setSelectedPictograms([...selectedPictograms, ...allPictograms]);
  };

  const speakPhrase = () => {
    const phraseText = selectedPictograms.map(p => p.text).join(' ');
    if (phraseText) {
      const utterance = new SpeechSynthesisUtterance(phraseText);
      utterance.lang = 'es-ES';
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleDownloadPhraseImages = () => {
    selectedPictograms.forEach((pictogram, index) => {
      const link = document.createElement('a');
      link.href = pictogram.imageUrl;
      link.download = `pictograma_${index + 1}.png`; 
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  };

  const handleSelectCategory = (cat) => {
    setSelectedPictograms([...selectedPictograms, cat]);
  };

  // --- Funciones de la Lista de la Compra ---
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
        <div className="header-tabs">
          <button 
            className={`tab-btn ${appMode === 'phraseBuilder' ? 'active' : ''}`}
            onClick={() => { setAppMode('phraseBuilder'); setSearchTerm(''); }}
          >
            Modo Frase
          </button>
          <button 
            className={`tab-btn ${appMode === 'shoppingList' ? 'active' : ''}`}
            onClick={() => { setAppMode('shoppingList'); setSearchTerm(''); }}
          >
            Lista de la Compra
          </button>
        </div>
      </header>

      <div className="main-content">
        <div className="pictogram-selection">
          <div className="search-bar">
            <input
              type="text"
              placeholder={appMode === 'shoppingList' ? 'Añadir artículo y pulsar Enter...' : 'Buscar pictogramas...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleInputKeyDown}
              className="search-input"
            />
            <button 
              onClick={startListening} 
              disabled={isListening} 
              className={`mic-btn ${isListening ? 'pulse-recording' : ''}`}
              aria-label="Dictar por Voz"
            >
              <span className="mic-icon">{isListening ? '🎙️' : '🎤'}</span> 
              <span className="mic-text">{isListening ? 'Escuchando...' : 'Dictar'}</span> 
            </button>
          </div>

          {appMode === 'phraseBuilder' && (
            <CategorySelector onSelectCategory={handleSelectCategory} />
          )}

          {appMode === 'phraseBuilder' ? (
            <PhraseBuilder
              allPictograms={allPictograms}
              loading={loading}
              error={error}
              searchTerm={searchTerm}
              selectedPictograms={selectedPictograms}
              handleAddAllToPhrase={handleAddAllToPhrase}
              handlePictogramSelect={handlePictogramSelect}
              speakPhrase={speakPhrase}
              handleDownloadPhraseImages={handleDownloadPhraseImages}
              handleRemoveLastPictogram={handleRemoveLastPictogram}
              handleClearPhrase={handleClearPhrase}
              handleRemovePictogram={handleRemovePictogram}
              setSelectedPictograms={setSelectedPictograms}
            />
          ) : (
            <ShoppingList
              shoppingListItems={shoppingListItems}
              loading={loading}
              handleToggleShoppingItem={handleToggleShoppingItem}
              handleClearShoppingList={handleClearShoppingList}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
