import React from 'react';

const CATEGORIES = [
  { id: 'yo', text: 'Yo', imageUrl: 'https://api.arasaac.org/api/pictograms/6632' },
  { id: 'tu', text: 'Tú', imageUrl: 'https://api.arasaac.org/api/pictograms/12281' },
  { id: 'quiero', text: 'Quiero', imageUrl: 'https://api.arasaac.org/api/pictograms/5441' },
  { id: 'comer', text: 'Comer', imageUrl: 'https://api.arasaac.org/api/pictograms/6456' },
  { id: 'beber', text: 'Beber', imageUrl: 'https://api.arasaac.org/api/pictograms/6061' },
  { id: 'jugar', text: 'Jugar', imageUrl: 'https://api.arasaac.org/api/pictograms/23392' },
  { id: 'ir', text: 'Ir', imageUrl: 'https://api.arasaac.org/api/pictograms/8142' },
  { id: 'parar', text: 'Parar', imageUrl: 'https://api.arasaac.org/api/pictograms/7196' },
  { id: 'si', text: 'Sí', imageUrl: 'https://api.arasaac.org/api/pictograms/5584' },
  { id: 'no', text: 'No', imageUrl: 'https://api.arasaac.org/api/pictograms/5526' },
  { id: 'feliz', text: 'Feliz', imageUrl: 'https://api.arasaac.org/api/pictograms/9907' },
  { id: 'duele', text: 'Duele', imageUrl: 'https://api.arasaac.org/api/pictograms/2367' }
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
