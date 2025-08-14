import React, { useState, useEffect } from 'react';
import './Categories.css';
// Aún no tenemos datos de API para esto, así que lo dejamos estático por ahora.
// Este componente está listo para cuando definamos qué mostrar aquí.

const categoryData = [
  { id: 1, title: 'Vida Nocturna' },
  { id: 2, title: 'Gastronomía' },
  { id: 3, title: 'Salas y Teatro' },
];

const Categories = () => {
  // Por ahora, este componente se mantiene estático como un "preview"
  // de las categorías de la app.
  return (
    <section className="categories-container">
      {categoryData.map((category) => (
        <div key={category.id} className="category-card">
          <div className="card-content">
            <h3>{category.title}</h3>
          </div>
        </div>
      ))}
    </section>
  );
};

export default Categories;