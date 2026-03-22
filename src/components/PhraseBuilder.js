import React, { useState } from 'react';
import PictogramGrid from './PictogramGrid';
import Pictogram from './Pictogram';

const PhraseBuilder = ({
  allPictograms,
  loading,
  error,
  searchTerm,
  selectedPictograms,
  handleAddAllToPhrase,
  handlePictogramSelect,
  speakPhrase,
  handleDownloadPhraseImages,
  handleRemoveLastPictogram,
  handleClearPhrase,
  handleRemovePictogram,
  setSelectedPictograms // Passed so we can reorder internals
}) => {
  // Drag and Drop state
  const [draggedItem, setDraggedItem] = useState(null);

  const onDragStart = (e, index) => {
    setDraggedItem(selectedPictograms[index]);
    e.dataTransfer.effectAllowed = "move";
    // For visual ghost effect:
    e.dataTransfer.setData("text/html", e.target.parentNode);
  };

  const onDragOver = (index) => {
    const draggedOverItem = selectedPictograms[index];
    if (draggedItem === draggedOverItem || draggedItem === null) return;

    const items = selectedPictograms.filter(item => item !== draggedItem);
    items.splice(index, 0, draggedItem);
    setSelectedPictograms(items);
  };

  return (
    <div className="phrase-builder-view">
      {!loading && !error && allPictograms.length > 0 && (
        <button className="primary-btn" onClick={handleAddAllToPhrase} style={{ marginBottom: '10px' }}>
          Añadir todos a la frase
        </button>
      )}

      {loading && <p className="loading-text">Cargando pictogramas...</p>}
      {error && <p className="error-text">Error al cargar pictogramas: {error.message}</p>}
      {!loading && !error && allPictograms.length === 0 && searchTerm && (
        <p className="no-results-text">No se encontraron pictogramas para "{searchTerm}".</p>
      )}
      
      {!loading && !error && allPictograms.length > 0 && (
        <PictogramGrid
          pictograms={allPictograms}
          onPictogramSelect={handlePictogramSelect}
        />
      )}
      {!loading && !error && !searchTerm && (
        <p className="info-text">Introduce un término de búsqueda, usa una categoría o usa el dictado por voz.</p>
      )}

      <div className="selected-phrase-section">
        <h2>Frase Seleccionada:</h2>
        <div className="selected-pictograms-container">
          {selectedPictograms.map((pictogram, index) => (
            <div
              key={`${pictogram.id}-${index}-${pictogram.text}`}
              className={`draggable-pictogram ${draggedItem === pictogram ? 'dragging' : ''}`}
              draggable
              onDragStart={(e) => onDragStart(e, index)}
              onDragOver={(e) => { e.preventDefault(); onDragOver(index); }}
              onDragEnd={() => setDraggedItem(null)}
            >
              <Pictogram
                imageUrl={pictogram.imageUrl}
                text={pictogram.text}
                onSelect={() => handleRemovePictogram(index)}
              />
            </div>
          ))}
        </div>
        
        {selectedPictograms.length > 0 && (
          <div className="phrase-actions">
            <button className="action-btn play-btn" onClick={speakPhrase}>
              <span className="icon">▶</span>
              <span className="action-text">Leer</span>
            </button>
            <button className="action-btn download-btn" onClick={handleDownloadPhraseImages}>
              <span className="icon">⬇️</span>
              <span className="action-text">Descargar</span>
            </button>
            <button className="action-btn delete-last-btn" onClick={handleRemoveLastPictogram}>
              <span className="action-text">Atrás</span>
            </button>
            <button className="action-btn delete-all-btn" onClick={handleClearPhrase}>
              <span className="action-text">Borrar</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PhraseBuilder;
