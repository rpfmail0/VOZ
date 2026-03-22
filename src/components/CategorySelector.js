import React from 'react';

const CATEGORIES = [
  { id: 'yo', text: 'Yo', imageUrl: 'https://api.arasaac.org/api/pictograms/7339' },
  { id: 'tu', text: 'Tú', imageUrl: 'https://api.arasaac.org/api/pictograms/2633' },
  { id: 'quiero', text: 'Quiero', imageUrl: 'https://api.arasaac.org/api/pictograms/2816' },
  { id: 'comer', text: 'Comer', imageUrl: 'https://api.arasaac.org/api/pictograms/2271' },
  { id: 'beber', text: 'Beber', imageUrl: 'https://api.arasaac.org/api/pictograms/2281' },
  { id: 'jugar', text: 'Jugar', imageUrl: 'https://api.arasaac.org/api/pictograms/3017' },
  { id: 'ir', text: 'Ir', imageUrl: 'https://api.arasaac.org/api/pictograms/2630' },
  { id: 'parar', text: 'Parar', imageUrl: 'https://api.arasaac.org/api/pictograms/2280' },
  { id: 'si', text: 'Sí', imageUrl: 'https://api.arasaac.org/api/pictograms/2832' },
  { id: 'no', text: 'No', imageUrl: 'https://api.arasaac.org/api/pictograms/2833' },
  { id: 'feliz', text: 'Feliz', imageUrl: 'https://api.arasaac.org/api/pictograms/2573' },
  { id: 'duele', text: 'Duele', imageUrl: 'https://api.arasaac.org/api/pictograms/2965' }
];

const CategorySelector = ({ onSelectCategory }) => {
  return (
    <div className="category-selector">
      <h3 className="category-title">Acceso Rápido / Categorías</h3>
      <div className="category-grid">
        {CATEGORIES.map(cat => (
          <div key={cat.id} className="category-item" onClick={() => onSelectCategory(cat)}>
            <img src={cat.imageUrl} alt={cat.text} className="category-img" />
            <span className="category-text">{cat.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategorySelector;
