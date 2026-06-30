import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Interview from './pages/Interview';
import Bozor from './pages/Bozor';
import Pricing from './pages/Pricing';
import PriceTicker from './components/PriceTicker';

export default function App() {
  return (
    <BrowserRouter>
      {/* Average market prices — top of every page, distinct from ad prices */}
      <PriceTicker />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/interview" element={<Interview />} />
        <Route path="/bozor" element={<Bozor />} />
        <Route path="/pricing" element={<Pricing />} />
      </Routes>
    </BrowserRouter>
  );
}
