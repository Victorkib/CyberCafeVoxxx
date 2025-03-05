import { BrowserRouter, Routes, Route } from 'react-router-dom';
import CyberCafeLandingPage from './pages/CyberCafeLandingPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/*" element={<CyberCafeLandingPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
