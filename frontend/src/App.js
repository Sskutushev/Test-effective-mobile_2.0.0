import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LandingPage from './pages/LandingPage';
import MarketplacePage from './pages/MarketplacePage';
import FeedPage from './pages/FeedPage';
import PersonsPage from './pages/PersonsPage';
import MessagesPage from './pages/MessagesPage';
import FavoritesPage from './pages/FavoritesPage';
import HelpCenterPage from './pages/HelpCenterPage';
import AuthPage from './pages/AuthPage'; // Import AuthPage
import MainLayout from './components/MainLayout';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} /> {/* Add AuthPage route */}
        <Route path="/home" element={<MainLayout><HomePage /></MainLayout>} />
        <Route path="/marketplace" element={<MainLayout><MarketplacePage /></MainLayout>} />
        <Route path="/feed" element={<MainLayout><FeedPage /></MainLayout>} />
        <Route path="/persons" element={<MainLayout><PersonsPage /></MainLayout>} />
        <Route path="/messages" element={<MainLayout><MessagesPage /></MainLayout>} />
        <Route path="/favorites" element={<MainLayout><FavoritesPage /></MainLayout>} />
        <Route path="/help" element={<MainLayout><HelpCenterPage /></MainLayout>} />
      </Routes>
    </Router>
  );
}

export default App;
