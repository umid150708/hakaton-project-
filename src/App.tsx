import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Interview from './pages/Interview';
import Bozor from './pages/Bozor';
import Pricing from './pages/Pricing';
import Profile from './pages/Profile';
import Learning from './pages/Learning';
import LessonView from './pages/LessonView';
import QuizPage from './pages/QuizPage';
import ApiDocs from './pages/ApiDocs';
import PriceTicker from './components/PriceTicker';
import { initAuth } from './lib/auth';

export default function App() {
  // Wire Supabase session → auth store once, at startup
  useEffect(() => { initAuth(); }, []);

  return (
    <BrowserRouter>
      {/* Average market prices — top of every page, distinct from ad prices */}
      <PriceTicker />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/interview" element={<Interview />} />
        <Route path="/bozor" element={<Bozor />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/oqitish" element={<Learning />} />
        <Route path="/oqitish/dars/:lessonId" element={<LessonView />} />
        <Route path="/oqitish/test/:levelId" element={<QuizPage />} />
        <Route path="/docs" element={<ApiDocs />} />
      </Routes>
    </BrowserRouter>
  );
}
