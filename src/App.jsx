import HeroSection from './components/Hero/HeroSection'; // Renombraremos y combinaremos Hero y Search
import Categories from './components/Categories/Categories';
import './App.css';

function App() {
  return (
    <div className="app-container">
      {/* Podríamos poner un Navbar aquí arriba en el futuro */}
      <main className="app-layout">
        
        {/* --- COLUMNA IZQUIERDA --- */}
        <div className="left-pane">
          <HeroSection />
        </div>

        {/* --- COLUMNA DERECHA --- */}
        <div className="right-pane">
          <Categories />
        </div>

      </main>
    </div>
  );
}

export default App;