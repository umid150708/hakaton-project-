import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useSearchParams } from 'react-router-dom';
import Landing from './pages/Landing';
import Interview from './pages/Interview';
import Result from './pages/Result';
import { useAppStore } from './stores/appStore';
import { DEMO_FIXTURE } from './lib/demoFixture';

// Handles ?demo=1 — loads fixture and jumps to result
function DemoLoader() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setResult } = useAppStore();

  useEffect(() => {
    if (searchParams.get('demo') === '1') {
      setResult(DEMO_FIXTURE);
      navigate('/result', { replace: true });
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
