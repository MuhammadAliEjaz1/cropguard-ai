import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Detect from './pages/Detect';
import Chat from './pages/Chat';
import About from './pages/About';
import CropCalendar from './pages/CropCalendar';
import FertilizerCalculator from './pages/FertilizerCalculator';
import DiseaseMap from './pages/DiseaseMap';
import Weather from './pages/Weather';
import PestIdentifier from './pages/PestIdentifier';
import Admin from './pages/Admin';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/detect" element={<Detect />} />
          <Route path="/pest" element={<PestIdentifier />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/about" element={<About />} />
          <Route path="/calendar" element={<CropCalendar />} />
          <Route path="/fertilizer" element={<FertilizerCalculator />} />
          <Route path="/map" element={<DiseaseMap />} />
          <Route path="/weather" element={<Weather />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
