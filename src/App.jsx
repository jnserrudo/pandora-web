// src/App.jsx
import Navbar from './Components/Navbar/Navbar';
import MainContent from './Components/MainContent/MainContent'; // Haremos este nuevo componente
import Footer from './Components/Footer/Footer';
import './App.css';

function App() {
  return (
    <div className="app-wrapper">
      <Navbar />
      <MainContent /> {/* Simplificamos para mayor claridad */}
      <Footer />
    </div>
  );
}

export default App;