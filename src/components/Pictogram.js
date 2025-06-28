import React from 'react';
import './Pictogram.css'; // Crearemos este archivo después

function Pictogram({ imageUrl, text, onSelect }) {
  return (
    <div className="pictogram" onClick={onSelect}>
      <img src={imageUrl} alt={text} className="pictogram-image" />
      <p className="pictogram-text">{text}</p>
    </div>
  );
}

export default Pictogram;