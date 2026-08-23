import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { HelmetProvider } from 'react-helmet-async';
import SmoothScrollProvider from './Components/motion/SmoothScrollProvider.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <SmoothScrollProvider>
        <AuthProvider>
          <HelmetProvider>
            <App />
          </HelmetProvider>
        </AuthProvider>
      </SmoothScrollProvider>
    </BrowserRouter>
  </StrictMode>,
)
