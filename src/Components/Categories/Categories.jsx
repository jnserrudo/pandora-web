import './Categories.css';

// Datos de las categorías (esto podría venir de tu API en el futuro)
const categoryData = [
  { id: 1, title: 'Vida Nocturna' },
  { id: 2, title: 'Gastronomía' },
  { id: 3, title: 'Salas y Teatro' },
];

export const Categories = () => {
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