import React, { useState, useEffect } from 'react';
import './ModuleConfigModal.css';

const AGENT_URL = 'http://192.168.1.97:8585';

function ModuleConfigModal({ moduleName, mode, onConfirm, onCancel }) {
  const [fields, setFields] = useState([]);
  const [values, setValues] = useState({});
  const [position, setPosition] = useState('bottom_bar');
  const [loading, setLoading] = useState(true);

  const POSITIONS = [
    'top_bar', 'top_left', 'top_center', 'top_right',
    'upper_third', 'middle_center', 'lower_third',
    'bottom_left', 'bottom_center', 'bottom_right', 'bottom_bar',
    'fullscreen_above', 'fullscreen_below'
  ];

  useEffect(() => {
    const fetchFields = fetch('/modules-config.json')
      .then(res => res.json())
      .then(data => data[moduleName]?.fields || []);

    if (mode === 'edit') {
      Promise.all([
        fetchFields,
        fetch(`${AGENT_URL}/config/modules/${moduleName}`).then(res => res.json())
      ]).then(([moduleFields, currentConfig]) => {
        setFields(moduleFields);
        setPosition(currentConfig.position || 'bottom_bar');
        const defaults = {};
        moduleFields.forEach(f => {
          if (f.default !== undefined) defaults[f.key] = f.default;
        });
        setValues({ ...defaults, ...currentConfig.config });
      }).finally(() => setLoading(false));
    } else {
      fetchFields.then(moduleFields => {
        setFields(moduleFields);
        const defaults = {};
        moduleFields.forEach(f => {
          if (f.default !== undefined) defaults[f.key] = f.default;
        });
        setValues(defaults);
      }).finally(() => setLoading(false));
    }
  }, [moduleName, mode]);

  const handleChange = (key, value) => {
    setValues(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    const missing = fields.filter(f => f.required && !values[f.key]);
    if (missing.length > 0) {
      alert(`Camps obligatoris: ${missing.map(f => f.label).join(', ')}`);
      return;
    }
    onConfirm(values, position);
  };

  const renderField = (field) => {
    switch (field.type) {
      case 'boolean':
        return (
          <div key={field.key} className="config-field">
            <label className="config-label">
              {field.label}
              {field.required && <span className="required">*</span>}
            </label>
            <div
              className={`toggle ${values[field.key] ? 'on' : 'off'}`}
              onClick={() => handleChange(field.key, !values[field.key])}
            >
              <div className="toggle-thumb" />
              <span>{values[field.key] ? 'Sí' : 'No'}</span>
            </div>
          </div>
        );

      case 'select':
        return (
          <div key={field.key} className="config-field">
            <label className="config-label">
              {field.label}
              {field.required && <span className="required">*</span>}
            </label>
            <select
              className="config-input"
              value={values[field.key] || field.default || ''}
              onChange={e => handleChange(field.key, e.target.value)}
            >
              {field.options.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        );

      default:
        return (
          <div key={field.key} className="config-field">
            <label className="config-label">
              {field.label}
              {field.required && <span className="required">*</span>}
            </label>
            <input
              className="config-input"
              type={field.type}
              value={values[field.key] || ''}
              placeholder={field.placeholder || ''}
              onChange={e => handleChange(field.key, field.type === 'number' ? Number(e.target.value) : e.target.value)}
            />
          </div>
        );
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3>{mode === 'edit' ? '✏️ Editar' : '⚙️ Configurar'} {moduleName}</h3>
          <button className="modal-close" onClick={onCancel}>✕</button>
        </div>

        <div className="modal-body">
          {loading && <p className="info">Carregant configuració...</p>}

          {!loading && (
            <div className="config-field">
              <label className="config-label">Posició al mirall</label>
              <select
                className="config-input"
                value={position}
                onChange={e => setPosition(e.target.value)}
              >
                {POSITIONS.map(pos => (
                  <option key={pos} value={pos}>{pos}</option>
                ))}
              </select>
            </div>
          )}

          {!loading && fields.length === 0 && (
            <p className="info">Aquest mòdul no necessita configuració addicional.</p>
          )}

          {fields.map(field => renderField(field))}
        </div>

        <div className="modal-footer">
          <button className="modal-btn cancel" onClick={onCancel}>
            Cancel·lar
          </button>
          <button className="modal-btn confirm" onClick={handleSubmit}>
            {mode === 'edit' ? '💾 Guardar' : '▶ Activar'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ModuleConfigModal;
