// src/App.jsx
import Navbar from '../Navbar/Navbar';
import MainContent from '../MainContent/MainContent'; // Haremos este nuevo componente
import Footer from '../Footer/Footer';
import '../../App.css';

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