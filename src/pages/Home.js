import React, { useEffect, useState } from 'react';
import './Home.css';

const AGENT_URL = 'http://192.168.1.97:8585';

function Home() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${AGENT_URL}/status`)
      .then(res => res.json())
      .then(data => {
        setStatus(data.ok ? 'connectat' : 'error');
      })
      .catch(() => setStatus('desconnectat'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="home">
      <div className="home-header">
        <h1>🪞 Lumirror</h1>
        <p>Control remot del teu MagicMirror</p>
      </div>
      <div className={`status-card ${status}`}>
        {loading ? (
          <span>Connectant amb el mirall...</span>
        ) : status === 'connectat' ? (
          <span>✅ Mirall connectat i funcionant</span>
        ) : (
          <span>❌ No s'ha pogut connectar amb el mirall</span>
        )}
      </div>
    </div>
  );
}

export default Home;
