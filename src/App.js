import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Modules from './pages/Modules';
import Store from './pages/Store';
import Settings from './pages/Settings';
import Navbar from './components/Navbar';
import './App.css';

const AGENT_URL = 'http://192.168.1.97:8585';

function App() {
  const [installedModules, setInstalledModules] = useState([]);

  useEffect(() => {
    fetch(`${AGENT_URL}/modules`)
      .then(res => res.json())
      .then(data => setInstalledModules(data.modules || []));
  }, []);

  return (
    <Router>
      <div className="app">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/modules" element={<Modules />} />
            <Route path="/store" element={<Store installedModules={installedModules} onInstall={() => {
            fetch(`${AGENT_URL}/modules`)
            .then(res => res.json())
            .then(data => setInstalledModules(data.modules || []));
            }} />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
