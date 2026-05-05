import React, { useState, useEffect } from 'react';
import './ModuleConfigModal.css';

function ModuleConfigModal({ moduleName, onConfirm, onCancel }) {
  const [fields, setFields] = useState([]);
  const [values, setValues] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/modules-config.json')
      .then(res => res.json())
      .then(data => {
        const moduleFields = data[moduleName]?.fields || [];
        setFields(moduleFields);
        const defaults = {};
        moduleFields.forEach(f => {
          if (f.default !== undefined) defaults[f.key] = f.default;
        });
        setValues(defaults);
      })
      .finally(() => setLoading(false));
  }, [moduleName]);

  const handleChange = (key, value) => {
    setValues(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    const missing = fields.filter(f => f.required && !values[f.key]);
    if (missing.length > 0) {
      alert(`Camps obligatoris: ${missing.map(f => f.label).join(', ')}`);
      return;
    }
    onConfirm(values);
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
          <h3>⚙️ Configurar {moduleName}</h3>
          <button className="modal-close" onClick={onCancel}>✕</button>
        </div>

        <div className="modal-body">
          {loading && <p className="info">Carregant configuració...</p>}
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
            ▶ Activar
          </button>
        </div>
      </div>
    </div>
  );
}

export default ModuleConfigModal;
