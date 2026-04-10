import { Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Navbar from './components/Navbar';
import Home from './pages/Home/Home';
import About from './pages/About/About';
import Attorneys from './pages/Attorneys/Attorneys';
import AttorneyDetail from './pages/Attorneys/AttorneyDetail';
import PracticeAreas from './pages/PracticeAreas/PracticeAreas';
import PracticeDetail from './pages/PracticeAreas/PracticeDetail';
import Articles from './pages/Articles/Articles';
import Results from './pages/Results/Results';
import Contact from './pages/Contact/Contact';

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/attorneys" element={<Attorneys />} />
        <Route path="/attorneys/:slug" element={<AttorneyDetail />} />
        <Route path="/practice" element={<PracticeAreas />} />
        <Route path="/practice/:slug" element={<PracticeDetail />} />
        <Route path="/articles" element={<Articles />} />
        <Route path="/results" element={<Results />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
