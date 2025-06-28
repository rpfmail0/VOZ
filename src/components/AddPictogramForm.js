import React, { useState } from 'react';
import './AddPictogramForm.css'; // Crearemos este archivo después

function AddPictogramForm({ onAddPictogram }) {
  const [text, setText] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [category, setCategory] = useState(''); // Podríamos necesitar un selector de categorías después

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text && imageUrl) {
      onAddPictogram({ id: Date.now().toString(), text, imageUrl, category }); // Usamos timestamp como ID simple
      setText('');
      setImageUrl('');
      setCategory('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="add-pictogram-form">
      <h3>Añadir Nuevo Pictograma</h3>
      <div>
        <label htmlFor="text">Texto:</label>
        <input
          type="text"
          id="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="imageUrl">URL de Imagen:</label>
        <input
          type="text"
          id="imageUrl"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          required
        />
      </div>
       {/* Aquí podríamos añadir un selector de categoría */}
      <button type="submit">Añadir Pictograma</button>
    </form>
  );
}

export default AddPictogramForm;