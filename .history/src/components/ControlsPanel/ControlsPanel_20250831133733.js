import React, { useState, useEffect } from 'react';
import './ControlsPanel.css';

const ControlsPanel = ({ onGenerate, isGenerating, initialParams }) => {
  const [params, setParams] = useState({
    seed: '',
    width: 20,
    height: 20,
    difficulty: 'medium',
    biome: 'dungeon',
    roomCount: 8,
    corridorWidth: 1,
    enableAI: true,
    ...initialParams
  });

  const [errors, setErrors] = useState({});
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    if (!params.seed) {
      generateRandomSeed();
    }
  }, []);

  const generateRandomSeed = () => {
    const seed = Math.random().toString(36).substring(2, 15);
    setParams(prev => ({ ...prev, seed }));
  };

  const validateParams = () => {
    const newErrors = {};
    
    if (params.width < 10 || params.width > 50) {
      newErrors.width = 'Width must be between 10 and 50';
    }
    
    if (params.height < 10 || params.height > 50) {
      newErrors.height = 'Height must be between 10 and 50';
    }
    
    if (params.roomCount < 3 || params.roomCount > 20) {
      newErrors.roomCount = 'Room count must be between 3 and 20';
    }
    
    if (!params.seed.trim()) {
      newErrors.seed = 'Seed is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateParams()) {
      onGenerate(params);
    }
  };

  const handleParamChange = (key, value) => {
    setParams(prev => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors(prev => ({ ...prev, [key]: null }));
    }
  };

  const biomeOptions = [
    { value: 'dungeon', label: '🏰 Classic Dungeon', desc: 'Stone corridors and chambers' },
    { value: 'cave', label: '🕳️ Natural Cave', desc: 'Organic cave systems' },
    { value: 'forest', label: '🌲 Forest Grove', desc: 'Woodland clearings' },
    { value: 'crypt', label: '⚰️ Ancient Crypt', desc: 'Undead-infested tombs' },
    { value: 'temple', label: '🏛️ Sacred Temple', desc: 'Divine architecture' },
    { value: 'tower', label: '🗼 Wizard Tower', desc: 'Magical spire levels' }
  ];

  const difficultyOptions = [
    { value: 'easy', label: 'Easy', desc: 'Beginner friendly' },
    { value: 'medium', label: 'Medium', desc: 'Balanced challenge' },
    { value: 'hard', label: 'Hard', desc: 'Experienced players' },
    { value: 'deadly', label: 'Deadly', desc: 'Extreme danger' }
  ];

  return (
    <div className="controls-panel">
      <div className="panel-header">
        <h2 className="panel-title">
          <span className="title-icon">⚙️</span>
          Generation Settings
        </h2>
        <div className="panel-subtitle">Configure your dungeon parameters</div>
      </div>

      <form onSubmit={handleSubmit} className="controls-form">
        {/* Basic Settings */}
        <div className="control-section">
          <h3 className="section-title">
            <span className="section-icon">🎲</span>
            Basic Settings
          </h3>

          <div className="form-group">
            <label className="form-label">
              Seed
              <span className="label-tooltip" title="Unique identifier for reproducible generation">ℹ️</span>
            </label>
            <div className="input-group">
              <input
                type="text"
                className={`form-input ${errors.seed ? 'error' : ''}`}
                value={params.seed}
                onChange={(e) => handleParamChange('seed', e.target.value)}
                placeholder="Enter seed or generate random"
              />
              <button
                type="button"
                className="input-button"
                onClick={generateRandomSeed}
                title="Generate random seed"
              >
                🎲
              </button>
            </div>
            {errors.seed && <div className="form-error">{errors.seed}</div>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Width</label>
              <input
                type="number"
                className={`form-input ${errors.width ? 'error' : ''}`}
                value={params.width}
                onChange={(e) => handleParamChange('width', parseInt(e.target.value))}
                min="10"
                max="50"
              />
              {errors.width && <div className="form-error">{errors.width}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Height</label>
              <input
                type="number"
                className={`form-input ${errors.height ? 'error' : ''}`}
                value={params.height}
                onChange={(e) => handleParamChange('height', parseInt(e.target.value))}
                min="10"
                max="50"
              />
              {errors.height && <div className="form-error">{errors.height}</div>}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Biome</label>
            <div className="select-wrapper">
              <select
                className="form-select"
                value={params.biome}
                onChange={(e) => handleParamChange('biome', e.target.value)}
              >
                {biomeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-hint">
              {biomeOptions.find(b => b.value === params.biome)?.desc}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Difficulty</label>
            <div className="difficulty-selector">
              {difficultyOptions.map(option => (
                <button
                  key={option.value}
                  type="button"
                  className={`difficulty-btn ${params.difficulty === option.value ? 'active' : ''}`}
                  onClick={() => handleParamChange('difficulty', option.value)}
                >
                  <div className="difficulty-label">{option.label}</div>
                  <div className="difficulty-desc">{option.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Advanced Settings */}
        <div className="control-section">
          <button
            type="button"
            className="section-toggle"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            <span className="section-icon">⚡</span>
            Advanced Settings
            <span className={`toggle-icon ${showAdvanced ? 'open' : ''}`}>▼</span>
          </button>

          {showAdvanced && (
            <div className="advanced-settings">
              <div className="form-group">
                <label className="form-label">Room Count</label>
                <div className="slider-group">
                  <input
                    type="range"
                    className="form-slider"
                    min="3"
                    max="20"
                    value={params.roomCount}
                    onChange={(e) => handleParamChange('roomCount', parseInt(e.target.value))}
                  />
                  <span className="slider-value">{params.roomCount}</span>
                </div>
                {errors.roomCount && <div className="form-error">{errors.roomCount}</div>}
              </div>

              <div className="form-group">
                <label className="form-label">Corridor Width</label>
                <div className="radio-group">
                  {[1, 2, 3].map(width => (
                    <label key={width} className="radio-item">
                      <input
                        type="radio"
                        name="corridorWidth"
                        value={width}
                        checked={params.corridorWidth === width}
                        onChange={(e) => handleParamChange('corridorWidth', parseInt(e.target.value))}
                      />
                      <span className="radio-label">{width} tile{width > 1 ? 's' : ''}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={params.enableAI}
                    onChange={(e) => handleParamChange('enableAI', e.target.checked)}
                  />
                  <span className="checkbox-label">
                    <span className="checkbox-icon">🤖</span>
                    Enable AI Enhancement
                  </span>
                </label>
                <div className="form-hint">
                  Generate detailed NPCs, lore, and descriptions
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Generate Button */}
        <button
          type="submit"
          className={`generate-btn ${isGenerating ? 'generating' : ''}`}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <>
              <span className="btn-spinner">⟳</span>
              Generating...
            </>
          ) : (
            <>
              <span className="btn-icon">🚀</span>
              Generate Dungeon
            </>
          )}
          {!isGenerating && <div className="btn-glow"></div>}
        </button>
      </form>
    </div>
  );
};

export default ControlsPanel;