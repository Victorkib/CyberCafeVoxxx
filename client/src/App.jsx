import { BrowserRouter, Routes, Route } from 'react-router-dom';
import CyberCafeLandingPage from './pages/CyberCafeLandingPage';
import LandingPage from './pages/LandingPage';
import ServicesPage from './pages/ServicesPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/*" element={<LandingPage />} />
        <Route path="/shop" element={<CyberCafeLandingPage />} />
        <Route path="/services" element={<ServicesPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
