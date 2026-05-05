import React, { useEffect, useState } from 'react';
import './Modules.css';

const AGENT_URL = 'http://192.168.1.97:8585';

const POSITIONS = [
  'top_bar', 'top_left', 'top_center', 'top_right',
  'upper_third', 'middle_center', 'lower_third',
  'bottom_left', 'bottom_center', 'bottom_right', 'bottom_bar',
  'fullscreen_above', 'fullscreen_below'
];

function Modules({ activeModules, onRefresh }) {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [working, setWorking] = useState(null);
  const [selectedPositions, setSelectedPositions] = useState({});
  const [restarting, setRestarting] = useState(false);

  useEffect(() => {
    fetch(`${AGENT_URL}/modules`)
      .then(res => res.json())
      .then(data => setModules(data.modules || []))
      .catch(() => setMessage({ type: 'error', text: '❌ No s\'ha pogut connectar amb el mirall' }))
      .finally(() => setLoading(false));
  }, []);

  const isActive = (mod) => activeModules.includes(mod);

  const handleActivate = (mod) => {
    setWorking(mod);
    setMessage(null);
    const position = selectedPositions[mod] || 'bottom_bar';

    fetch(`${AGENT_URL}/config/modules/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ moduleName: mod, position })
    })
      .then(res => res.json())
      .then(data => {
        if (data.ok) {
          setMessage({ type: 'success', text: `✅ ${mod} activat! Reinicia el mirall per veure els canvis.` });
          if (onRefresh) onRefresh();
        } else {
          setMessage({ type: 'error', text: `❌ ${data.error}` });
        }
      })
      .catch(() => setMessage({ type: 'error', text: '❌ No s\'ha pogut connectar amb el mirall' }))
      .finally(() => setWorking(null));
  };

  const handleDeactivate = (mod) => {
    setWorking(mod);
    setMessage(null);

    fetch(`${AGENT_URL}/config/modules/remove`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ moduleName: mod })
    })
      .then(res => res.json())
      .then(data => {
        if (data.ok) {
          setMessage({ type: 'success', text: `✅ ${mod} desactivat! Reinicia el mirall per veure els canvis.` });
          if (onRefresh) onRefresh();
        } else {
          setMessage({ type: 'error', text: `❌ ${data.error}` });
        }
      })
      .catch(() => setMessage({ type: 'error', text: '❌ No s\'ha pogut connectar amb el mirall' }))
      .finally(() => setWorking(null));
  };

  const handleRestart = () => {
    setRestarting(true);
    setMessage(null);

    fetch(`${AGENT_URL}/restart`, { method: 'POST' })
      .then(res => res.json())
      .then(data => {
        if (data.ok) {
          setMessage({ type: 'success', text: '✅ MagicMirror reiniciant... espera uns segons.' });
        } else {
          setMessage({ type: 'error', text: `❌ ${data.error}` });
        }
      })
      .catch(() => setMessage({ type: 'error', text: '❌ No s\'ha pogut connectar amb el mirall' }))
      .finally(() => setRestarting(false));
  };

  return (
    <div className="modules">
      <div className="modules-header">
        <h2>Mòduls instal·lats</h2>
        <button
          className="restart-btn"
          onClick={handleRestart}
          disabled={restarting}
        >
          {restarting ? '⏳ Reiniciant...' : '🔄 Reiniciar Mirall'}
        </button>
      </div>

      {message && (
        <div className={`modules-message ${message.type}`}>
          {message.text}
        </div>
      )}

      {loading && <p className="info">Carregant mòduls...</p>}

      <div className="modules-grid">
        {modules.filter(m => m !== 'default').map(mod => (
          <div key={mod} className={`module-card ${isActive(mod) ? 'active' : ''}`}>
            <div className="module-card-header">
              <span className="module-icon">📦</span>
              <span className={`module-status ${isActive(mod) ? 'on' : 'off'}`}>
                {isActive(mod) ? '● Actiu' : '○ Inactiu'}
              </span>
            </div>
            <span className="module-name">{mod}</span>

            {!isActive(mod) && (
              <select
                className="position-select"
                value={selectedPositions[mod] || 'bottom_bar'}
                onChange={e => setSelectedPositions({ ...selectedPositions, [mod]: e.target.value })}
              >
                {POSITIONS.map(pos => (
                  <option key={pos} value={pos}>{pos}</option>
                ))}
              </select>
            )}

            <button
              className={`module-btn ${isActive(mod) ? 'deactivate' : 'activate'}`}
              onClick={() => isActive(mod) ? handleDeactivate(mod) : handleActivate(mod)}
              disabled={working === mod}
            >
              {working === mod ? '⏳ Treballant...' :
                isActive(mod) ? '⏹ Desactivar' : '▶ Activar'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Modules;
