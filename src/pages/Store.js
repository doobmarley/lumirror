import React, { useEffect, useState } from 'react';
import './Store.css';

function Store({ installedModules }) {
  const [modules, setModules] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('Tots');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/modules.json')
      .then(res => res.json())
      .then(data => {
        setModules(data);
        const cats = ['Tots', ...new Set(data.map(m => m.category))];
        setCategories(cats);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = modules.filter(m => {
    const matchCat = selectedCategory === 'Tots' || m.category === selectedCategory;
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.description.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const isInstalled = (id) => installedModules.includes(id);

  return (
    <div className="store">
      <h2>Store de Mòduls</h2>

      <div className="store-filters">
        <input
          type="text"
          placeholder="Cerca mòduls..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="store-search"
        />
        <div className="store-categories">
          {categories.map(cat => (
            <button
              key={cat}
              className={`cat-btn ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {loading && <p className="info">Carregant mòduls...</p>}

      <div className="store-grid">
        {filtered.map(mod => (
          <div key={mod.id} className={`store-card ${isInstalled(mod.id) ? 'installed' : ''}`}>
            <div className="store-card-header">
              <span className="store-card-category">{mod.category}</span>
              {isInstalled(mod.id) && <span className="installed-badge">✅ Instal·lat</span>}
            </div>
            <h3 className="store-card-name">{mod.name}</h3>
            <p className="store-card-desc">{mod.description}</p>
            <div className="store-card-footer">
              <span className="store-card-stars">{'⭐'.repeat(mod.stars)}</span>
              {mod.requiresApiKey && <span className="api-badge">🔑 Requereix API</span>}
              <a href={mod.repo} target="_blank" rel="noreferrer" className="store-card-link">
                GitHub →
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Store;
