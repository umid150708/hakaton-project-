import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useSearchParams } from 'react-router-dom';
import Landing from './pages/Landing';
import Interview from './pages/Interview';
import Result from './pages/Result';
import { useAppStore } from './stores/appStore';
import { DEMO_FIXTURE, DEMO_PRICES, DEMO_REVENUE_CHECK } from './lib/demoFixture';

// Handles ?demo=1 — loads fixture + prices and jumps to result
function DemoLoader() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setResult, setPrices } = useAppStore();

  useEffect(() => {
    if (searchParams.get('demo') === '1') {
      // Set prices first so Result page has them before rendering
      setPrices(DEMO_PRICES, DEMO_REVENUE_CHECK);
      setResult(DEMO_FIXTURE);
      navigate('/result?demo=1', { replace: true });
    }
  }, []);

  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <DemoLoader />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/interview" element={<Interview />} />
        <Route path="/result" element={<Result />} />
      </Routes>
    </BrowserRouter>
  );
}
