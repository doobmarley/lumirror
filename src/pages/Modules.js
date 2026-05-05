import React, { useEffect, useState } from 'react';
import './Modules.css';

const AGENT_URL = 'http://192.168.1.97:8585';

function Modules() {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${AGENT_URL}/modules`)
      .then(res => res.json())
      .then(data => setModules(data.modules || []))
      .catch(() => setError('No s\'ha pogut connectar amb el mirall'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="modules">
      <h2>Mòduls instal·lats</h2>
      {loading && <p className="info">Carregant mòduls...</p>}
      {error && <p className="error">{error}</p>}
      <div className="modules-grid">
        {modules.map(mod => (
          <div key={mod} className="module-card">
            <span className="module-icon">📦</span>
            <span className="module-name">{mod}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Modules;
