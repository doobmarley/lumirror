import React, { useEffect, useState, useCallback } from 'react';
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
  const [defaultModules, setDefaultModules] = useState([]);
  const [activeModules, setActiveModules] = useState([]);

  const refreshModules = useCallback(() => {
    fetch(`${AGENT_URL}/modules`)
      .then(res => res.json())
      .then(data => {
        setInstalledModules(data.modules || []);
        setDefaultModules((data.defaultModules || []).filter(m => !m.endsWith('.js')));
      });
  }, []);

  const refreshActive = useCallback(() => {
    fetch(`${AGENT_URL}/config/modules`)
      .then(res => res.json())
      .then(data => {
        const matches = [...(data.raw || '').matchAll(/module:\s*["']([^"']+)["']/g)];
        setActiveModules(matches.map(m => m[1]));
      });
  }, []);

  useEffect(() => {
    refreshModules();
    refreshActive();
  }, [refreshModules, refreshActive]);

  return (
    <Router>
      <div className="app">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/modules" element={
              <Modules
                activeModules={activeModules}
                defaultModules={defaultModules}
                onRefresh={refreshActive}
              />}
            />
            <Route path="/store" element={
              <Store
                installedModules={installedModules}
                onInstall={refreshModules}
              />}
            />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
