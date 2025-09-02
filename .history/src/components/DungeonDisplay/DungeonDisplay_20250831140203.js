import React, { useState, useRef, useEffect } from 'react';
import './DungeonDisplay.css';

const DungeonDisplay = ({ dungeonData, isGenerating }) => {
  const [activeTab, setActiveTab] = useState('map');
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [zoom, setZoom] = useState(1);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (dungeonData && activeTab === 'map') {
      drawDungeon();
    }
  }, [dungeonData, activeTab, zoom]);

  const drawDungeon = () => {
    const canvas = canvasRef.current;
    if (!canvas || !dungeonData) return;

    const ctx = canvas.getContext('2d');
    const { width, height, grid, rooms } = dungeonData;
    
    // Set canvas size with reasonable limits
    const cellSize = Math.max(8, Math.min(20 * zoom, 40));
    const canvasWidth = width * cellSize;
    const canvasHeight = height * cellSize;
    
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    
    // Clear canvas with dark background
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    
    // Draw outer border to show dungeon boundaries
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, canvasWidth, canvasHeight);
    
    // Draw grid (optional, lighter)
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 0.5;
    for (let x = 0; x <= width; x++) {
      ctx.beginPath();
      ctx.moveTo(x * cellSize, 0);
      ctx.lineTo(x * cellSize, canvasHeight);
      ctx.stroke();
    }
    for (let y = 0; y <= height; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * cellSize);
      ctx.lineTo(canvasWidth, y * cellSize);
      ctx.stroke();
    }
    
    // Draw dungeon cells
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const cell = grid[y][x];
        let color = '#1e293b'; // Wall
        
        switch (cell) {
          case 1: // Floor
            color = '#475569';
            break;
          case 2: // Door
            color = '#f59e0b';
            break;
          case 3: // Room center
            color = '#64748b';
            break;
          default:
            color = '#1e293b';
        }
        
        ctx.fillStyle = color;
        ctx.fillRect(
          x * cellSize + 1, 
          y * cellSize + 1, 
          cellSize - 2, 
          cellSize - 2
        );
      }
    }
    
    // Draw room highlights
    if (rooms && selectedRoom !== null) {
      const room = rooms[selectedRoom];
      if (room) {
        ctx.strokeStyle = '#2563eb';
        ctx.lineWidth = 3;
        ctx.strokeRect(
          room.x * cellSize,
          room.y * cellSize,
          room.width * cellSize,
          room.height * cellSize
        );
        
        // Add room number
        ctx.fillStyle = '#2563eb';
        ctx.font = `${Math.max(10, cellSize / 2)}px Inter, sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(
          (selectedRoom + 1).toString(),
          (room.x + room.width / 2) * cellSize,
          (room.y + room.height / 2) * cellSize + cellSize / 6
        );
      }
    }
  };

  const handleCanvasClick = (e) => {
    if (!dungeonData) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / (20 * zoom));
    const y = Math.floor((e.clientY - rect.top) / (20 * zoom));
    
    // Find which room was clicked
    const roomIndex = dungeonData.rooms?.findIndex(room => 
      x >= room.x && x < room.x + room.width &&
      y >= room.y && y < room.y + room.height
    );
    
    setSelectedRoom(roomIndex >= 0 ? roomIndex : null);
  };

  const tabs = [
    { id: 'map', label: '🗺️ Map', desc: 'Visual dungeon layout' },
    { id: 'data', label: '📊 Data', desc: 'JSON structure' },
    { id: 'encounters', label: '⚔️ Encounters', desc: 'Combat scenarios' },
    { id: 'npcs', label: '👥 NPCs', desc: 'Non-player characters' },
    { id: 'loot', label: '💎 Loot', desc: 'Treasure tables' }
  ];

  if (isGenerating) {
    return (
      <div className="dungeon-display">
        <div className="display-header">
          <h2 className="display-title">
            <span className="title-icon">🎲</span>
            Generating Your Dungeon
          </h2>
        </div>
        
        <div className="generation-status">
          <div className="generation-spinner">
            <div className="spinner-ring"></div>
            <div className="spinner-center">⚔️</div>
          </div>
          
          <div className="generation-steps">
            <div className="step active">
              <span className="step-icon">🏗️</span>
              <span className="step-text">Building layout...</span>
            </div>
            <div className="step active">
              <span className="step-icon">🚪</span>
              <span className="step-text">Placing rooms and corridors...</span>
            </div>
            <div className="step active">
              <span className="step-icon">🤖</span>
              <span className="step-text">AI enhancement in progress...</span>
            </div>
            <div className="step">
              <span className="step-icon">✨</span>
              <span className="step-text">Finalizing details...</span>
            </div>
          </div>
          
          <div className="generation-quote">
            <em>"Every great adventure begins with a single step into the unknown..."</em>
          </div>
        </div>
      </div>
    );
  }

  if (!dungeonData) {
    return (
      <div className="dungeon-display">
        <div className="display-header">
          <h2 className="display-title">
            <span className="title-icon">🎯</span>
            Ready to Create
          </h2>
        </div>
        
        <div className="empty-state">
          <div className="empty-icon">🏰</div>
          <h3 className="empty-title">Your Dungeon Awaits</h3>
          <p className="empty-description">
            Configure your parameters in the settings panel and click "Generate Dungeon" 
            to create your first procedural dungeon with AI-enhanced content.
          </p>
          
          <div className="empty-features">
            <div className="feature-preview">
              <span className="preview-icon">🗺️</span>
              <span className="preview-text">Interactive Maps</span>
            </div>
            <div className="feature-preview">
              <span className="preview-icon">👥</span>
              <span className="preview-text">AI NPCs</span>
            </div>
            <div className="feature-preview">
              <span className="preview-icon">💎</span>
              <span className="preview-text">Dynamic Loot</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dungeon-display">
      <div className="display-header">
        <h2 className="display-title">
          <span className="title-icon">🏰</span>
          Generated Dungeon
        </h2>
        
        <div className="display-info">
          <span className="info-item">
            <span className="info-icon">📏</span>
            {dungeonData.width}×{dungeonData.height}
          </span>
          <span className="info-item">
            <span className="info-icon">🚪</span>
            {dungeonData.rooms?.length || 0} rooms
          </span>
          <span className="info-item">
            <span className="info-icon">🎲</span>
            {dungeonData.metadata?.seed}
          </span>
        </div>
      </div>

      <div className="display-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
            title={tab.desc}
          >
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="display-content">
        {activeTab === 'map' && (
          <div className="map-container">
            <div className="map-controls">
              <div className="zoom-controls">
                <button 
                  className="zoom-btn"
                  onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}
                  disabled={zoom <= 0.5}
                >
                  🔍-
                </button>
                <span className="zoom-level">{Math.round(zoom * 100)}%</span>
                <button 
                  className="zoom-btn"
                  onClick={() => setZoom(Math.min(3, zoom + 0.25))}
                  disabled={zoom >= 3}
                >
                  🔍+
                </button>
              </div>
              
              <div className="map-info">
                <span className="info-text">
                  📐 {dungeonData.width}×{dungeonData.height} cells
                </span>
                <span className="info-text">
                  🖱️ Click rooms to inspect
                </span>
              </div>
              
              <div className="map-legend">
                <div className="legend-item">
                  <div className="legend-color wall"></div>
                  <span>Wall</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color floor"></div>
                  <span>Floor</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color door"></div>
                  <span>Door</span>
                </div>
              </div>
            </div>
            
            <div className="map-viewport">
              <canvas
                ref={canvasRef}
                className="dungeon-canvas"
                onClick={handleCanvasClick}
              />
            </div>
            
            {selectedRoom !== null && dungeonData.rooms?.[selectedRoom] && (
              <div className="room-info">
                <h4 className="room-title">
                  <span className="room-icon">🚪</span>
                  Room {selectedRoom + 1}
                </h4>
                <div className="room-details">
                  <div className="room-stat">
                    <span className="stat-label">Size:</span>
                    <span className="stat-value">
                      {dungeonData.rooms[selectedRoom].width}×{dungeonData.rooms[selectedRoom].height}
                    </span>
                  </div>
                  <div className="room-stat">
                    <span className="stat-label">Type:</span>
                    <span className="stat-value">
                      {dungeonData.rooms[selectedRoom].type || 'Chamber'}
                    </span>
                  </div>
                  <div className="room-stat">
                    <span className="stat-label">Position:</span>
                    <span className="stat-value">
                      ({dungeonData.rooms[selectedRoom].x}, {dungeonData.rooms[selectedRoom].y})
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'data' && (
          <div className="data-container">
            <div className="data-header">
              <h3 className="data-title">JSON Structure</h3>
              <button 
                className="copy-btn"
                onClick={() => navigator.clipboard.writeText(JSON.stringify(dungeonData, null, 2))}
              >
                📋 Copy JSON
              </button>
            </div>
            <pre className="json-display">
              {JSON.stringify(dungeonData, null, 2)}
            </pre>
          </div>
        )}

        {activeTab === 'encounters' && (
          <div className="encounters-container">
            <h3 className="section-title">Combat Encounters</h3>
            <div className="encounters-grid">
              {dungeonData.encounters?.map((encounter, index) => (
                <div key={index} className="encounter-card">
                  <div className="encounter-header">
                    <span className="encounter-icon">⚔️</span>
                    <h4 className="encounter-name">{encounter.name}</h4>
                    <span className="encounter-cr">CR {encounter.challengeRating}</span>
                  </div>
                  <p className="encounter-description">{encounter.description}</p>
                  <div className="encounter-creatures">
                    {encounter.creatures?.map((creature, i) => (
                      <span key={i} className="creature-tag">
                        {creature.count}× {creature.name}
                      </span>
                    ))}
                  </div>
                </div>
              )) || (
                <div className="empty-section">
                  <span className="empty-icon">⚔️</span>
                  <p>No encounters generated. Enable AI enhancement for dynamic encounters.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'npcs' && (
          <div className="npcs-container">
            <h3 className="section-title">Non-Player Characters</h3>
            <div className="npcs-grid">
              {dungeonData.npcs?.map((npc, index) => (
                <div key={index} className="npc-card">
                  <div className="npc-avatar">{npc.avatar || '👤'}</div>
                  <div className="npc-info">
                    <h4 className="npc-name">{npc.name}</h4>
                    <p className="npc-race-class">{npc.race} {npc.class}</p>
                    <p className="npc-description">{npc.description}</p>
                    <div className="npc-stats">
                      <span className="stat-item">AC {npc.ac}</span>
                      <span className="stat-item">HP {npc.hp}</span>
                      <span className="stat-item">CR {npc.cr}</span>
                    </div>
                  </div>
                </div>
              )) || (
                <div className="empty-section">
                  <span className="empty-icon">👥</span>
                  <p>No NPCs generated. Enable AI enhancement for character generation.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'loot' && (
          <div className="loot-container">
            <h3 className="section-title">Treasure & Loot Tables</h3>
            <div className="loot-tables">
              {dungeonData.loot?.map((table, index) => (
                <div key={index} className="loot-table">
                  <h4 className="table-name">
                    <span className="table-icon">💎</span>
                    {table.name}
                  </h4>
                  <div className="loot-items">
                    {table.items?.map((item, i) => (
                      <div key={i} className="loot-item">
                        <span className="item-icon">{item.icon}</span>
                        <span className="item-name">{item.name}</span>
                        <span className="item-rarity">{item.rarity}</span>
                        <span className="item-value">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )) || (
                <div className="empty-section">
                  <span className="empty-icon">💎</span>
                  <p>Loot tables are being generated...</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DungeonDisplay;