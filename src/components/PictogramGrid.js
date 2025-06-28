import React from 'react';
import Pictogram from './Pictogram';
import './PictogramGrid.css'; // Crearemos este archivo después

function PictogramGrid({ pictograms, onPictogramSelect }) {
  return (
    <div className="pictogram-grid">
      {pictograms.map(pictogram => (
        <Pictogram
          key={pictogram.id} // Asumimos que cada pictograma tiene un ID único
          imageUrl={pictogram.imageUrl}
          text={pictogram.text}
          onSelect={() => onPictogramSelect(pictogram)}
        />
      ))}
    </div>
  );
}

export default PictogramGrid;