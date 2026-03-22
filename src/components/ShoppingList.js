import React from 'react';

const ShoppingList = ({
  shoppingListItems,
  loading,
  handleToggleShoppingItem,
  handleClearShoppingList
}) => {
  return (
    <div className="shopping-list-view">
      <h2>Lista de la Compra</h2>
      {loading && <p className="loading-text">Añadiendo artículo...</p>}
      <ul className="shopping-list">
        {shoppingListItems.map((item) => (
          <li key={item.id} className={`shopping-list-item ${item.checked ? 'checked' : ''}`}>
            <label className="shopping-item-label">
              <input
                type="checkbox"
                checked={item.checked}
                onChange={() => handleToggleShoppingItem(item.id)}
              />
              <span className="custom-checkbox"></span>
              {item.imageUrl ? (
                <img src={item.imageUrl} alt={item.text} className="shopping-item-picto" />
              ) : (
                <span className="shopping-item-picto-placeholder"></span>
              )}
              <span className="item-text">{item.text}</span>
            </label>
          </li>
        ))}
      </ul>
      {shoppingListItems.length > 0 && (
        <button className="clear-list-btn action-btn delete-all-btn" onClick={handleClearShoppingList}>Borrar Lista</button>
      )}
      {shoppingListItems.length === 0 && !loading && (
        <p className="empty-list-text">La lista está vacía. Añade artículos escribiendo arriba o usando el dictado por voz.</p>
      )}
    </div>
  );
};

export default ShoppingList;
