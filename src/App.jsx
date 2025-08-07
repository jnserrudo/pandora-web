import Navbar from './Components/Navbar/Navbar';
import HeroSection from './Components/Hero/HeroSection';
import {Categories} from './Components/Categories/Categories';
import {Search} from './Components/Search/Search';
import Footer from './Components/Footer/Footer';
import './App.css';

function App() {
  return (
    <div className="app-wrapper">
      <Navbar />
      <main className="app-container">
        <div className="app-layout">
          <HeroSection />
          <Categories />
          <Search />
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default App;