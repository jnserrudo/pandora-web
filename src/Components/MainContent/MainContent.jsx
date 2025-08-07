// src/components/MainContent/MainContent.jsx
import HeroSection from '../Hero/HeroSection';
import {Categories} from '../Categories/Categories';
import {Search} from '../Search/Search';
import './MainContent.css';

const MainContent = () => {
  return (
    <main className="app-container">
      <div className="app-layout">
        <HeroSection />
        <Categories />
        <Search />
      </div>
    </main>
  );
};

export default MainContent;