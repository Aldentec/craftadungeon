import React, { useState } from 'react';
import './ExportPanel.css';

const ExportPanel = ({ dungeonData, params }) => {
  const [exportFormat, setExportFormat] = useState('json');
  const [isExporting, setIsExporting] = useState(false);

  const exportFormats = [
    {
      id: 'json',
      name: 'JSON Data',
      icon: '📄',
      description: 'Complete dungeon data structure',
      fileExt: 'json'
    },
    {
      id: 'png',
      name: 'PNG Image',
      icon: '🖼️',
      description: 'Visual map for printing',
      fileExt: 'png'
    },
    {
      id: 'unity',
      name: 'Unity Package',
      icon: '🎮',
      description: 'Ready for Unity import',
      fileExt: 'unitypackage'
    },
    {
      id: 'pdf',
      name: 'PDF Report',
      icon: '📑',
      description: 'Complete adventure module',
      fileExt: 'pdf'
    }
  ];

  const handleExport = async (format) => {
    if (!dungeonData) return;
    
    setIsExporting(true);
    
    try {
      switch (format) {
        case 'json':
          await exportJSON();
          break;
        case 'png':
          await exportPNG();
          break;
        case 'unity':
          await exportUnity();
          break;
        case 'pdf':
          await exportPDF();
          break;
        default:
          console.warn('Unknown export format:', format);
      }
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const exportJSON = async () => {
    const jsonData = JSON.stringify(dungeonData, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `dungeon-${dungeonData.metadata.seed}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportPNG = async () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const { width, height, grid } = dungeonData;
    const cellSize = 10;
    
    canvas.width = width * cellSize;
    canvas.height = height * cellSize;
    
    // Draw dungeon
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const cell = grid[y][x];
        let color = '#1e293b';
        
        switch (cell) {
          case 1: color = '#475569'; break;
          case 2: color = '#f59e0b'; break;
          case 3: color = '#64748b'; break;
          default: color = '#1e293b';
        }
        
        ctx.fillStyle = color;
        ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
      }
    }
    
    // Convert to blob and download
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `dungeon-${dungeonData.metadata.seed}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    });
  };

  const exportUnity = async () => {
    const unityScript = generateUnityScript();
    const blob = new Blob([unityScript], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `DungeonImporter-${dungeonData.metadata.seed}.cs`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportPDF = async () => {
    const pdfContent = generatePDFContent();
    const blob = new Blob([pdfContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `adventure-${dungeonData.metadata.seed}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const generateUnityScript = () => {
    return `using UnityEngine;
using System.Collections.Generic;

[System.Serializable]
public class DungeonData_${dungeonData.metadata.seed}
{
    public static readonly int WIDTH = ${dungeonData.width};
    public static readonly int HEIGHT = ${dungeonData.height};
    
    public static readonly int[,] GRID = new int[,] {
${dungeonData.grid.map(row => 
  '        {' + row.join(', ') + '}'
).join(',\n')}
    };
    
    public static readonly Vector2Int[] ROOM_POSITIONS = new Vector2Int[] {
${dungeonData.rooms?.map(room => 
  `        new Vector2Int(${room.x}, ${room.y})`
).join(',\n') || ''}
    };
    
    // Cell types: 0 = Wall, 1 = Floor, 2 = Door, 3 = Room Center
    public static GameObject CreateDungeon(GameObject wallPrefab, GameObject floorPrefab, GameObject doorPrefab)
    {
        GameObject dungeonParent = new GameObject("Generated_Dungeon_${dungeonData.metadata.seed}");
        
        for (int y = 0; y < HEIGHT; y++)
        {
            for (int x = 0; x < WIDTH; x++)
            {
                Vector3 position = new Vector3(x, 0, y);
                GameObject prefabToUse = null;
                
                switch (GRID[y, x])
                {
                    case 0: prefabToUse = wallPrefab; break;
                    case 1: prefabToUse = floorPrefab; break;
                    case 2: prefabToUse = doorPrefab; break;
                    case 3: prefabToUse = floorPrefab; break;
                }
                
                if (prefabToUse != null)
                {
                    GameObject tile = Instantiate(prefabToUse, position, Quaternion.identity, dungeonParent.transform);
                    tile.name = $"Tile_{x}_{y}";
                }
            }
        }
        
        return dungeonParent;
    }
}`;
  };

  const generatePDFContent = () => {
    return `DUNGEON ADVENTURE MODULE
Generated by AI Dungeon Crafter
Seed: ${dungeonData.metadata.seed}
Generated: ${new Date(dungeonData.metadata.generatedAt).toLocaleDateString()}

=== DUNGEON OVERVIEW ===
Size: ${dungeonData.width} x ${dungeonData.height}
Rooms: ${dungeonData.rooms?.length || 0}
Difficulty: ${params.difficulty}
Biome: ${params.biome}

=== ROOM DESCRIPTIONS ===
${dungeonData.rooms?.map((room, index) => `
Room ${index + 1}: ${room.type || 'Chamber'}
Size: ${room.width} x ${room.height}
Location: (${room.x}, ${room.y})
Description: ${room.description || 'A mysterious chamber awaits exploration.'}
`).join('') || 'No rooms generated.'}

=== NON-PLAYER CHARACTERS ===
${dungeonData.npcs?.map((npc, index) => `
${npc.name} (${npc.race} ${npc.class})
AC: ${npc.ac}, HP: ${npc.hp}, CR: ${npc.cr}
Description: ${npc.description}
`).join('') || 'No NPCs generated.'}

=== TREASURE & LOOT ===
${dungeonData.loot?.map((table, index) => `
${table.name}:
${table.items?.map(item => `- ${item.name} (${item.rarity}) - ${item.value}`).join('\n') || 'No items.'}
`).join('') || 'No loot tables generated.'}

=== ENCOUNTERS ===
${dungeonData.encounters?.map((encounter, index) => `
${encounter.name} (CR ${encounter.challengeRating})
${encounter.description}
Creatures: ${encounter.creatures?.map(c => `${c.count}x ${c.name}`).join(', ') || 'None'}
`).join('') || 'No encounters generated.'}

End of Module
Generated with AI Dungeon Crafter Professional Edition`;
  };

  const getFileSize = () => {
    if (!dungeonData) return '0 KB';
    
    const jsonSize = JSON.stringify(dungeonData).length;
    const kb = Math.round(jsonSize / 1024);
    return `${kb} KB`;
  };

  return (
    <div className="export-panel">
      <div className="panel-header">
        <h3 className="panel-title">
          <span className="title-icon">📤</span>
          Export Options
        </h3>
        <div className="panel-subtitle">Download your dungeon in multiple formats</div>
      </div>

      <div className="export-formats">
        {exportFormats.map(format => (
          <div 
            key={format.id}
            className={`format-card ${exportFormat === format.id ? 'selected' : ''}`}
            onClick={() => setExportFormat(format.id)}
          >
            <div className="format-icon">{format.icon}</div>
            <div className="format-info">
              <div className="format-name">{format.name}</div>
              <div className="format-description">{format.description}</div>
            </div>
            <div className="format-meta">
              <span className="file-ext">.{format.fileExt}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="export-details">
        <div className="detail-row">
          <span className="detail-label">File Size:</span>
          <span className="detail-value">{getFileSize()}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Seed:</span>
          <span className="detail-value">{dungeonData?.metadata?.seed}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Generated:</span>
          <span className="detail-value">
            {dungeonData?.metadata?.generatedAt 
              ? new Date(dungeonData.metadata.generatedAt).toLocaleDateString()
              : 'Unknown'
            }
          </span>
        </div>
      </div>

      <div className="export-actions">
        <button
          className="export-btn primary"
          onClick={() => handleExport(exportFormat)}
          disabled={isExporting || !dungeonData}
        >
          {isExporting ? (
            <>
              <span className="btn-spinner">⟳</span>
              Exporting...
            </>
          ) : (
            <>
              <span className="btn-icon">📥</span>
              Export {exportFormats.find(f => f.id === exportFormat)?.name}
            </>
          )}
        </button>

        <button
          className="export-btn secondary"
          onClick={() => handleExport('json')}
          disabled={isExporting || !dungeonData}
        >
          <span className="btn-icon">📋</span>
          Quick JSON
        </button>
      </div>

      <div className="export-help">
        <div className="help-header">
          <span className="help-icon">💡</span>
          <span className="help-title">Export Guide</span>
        </div>
        <div className="help-content">
          <div className="help-item">
            <strong>JSON:</strong> Complete data structure for developers
          </div>
          <div className="help-item">
            <strong>PNG:</strong> Visual map perfect for printing and sharing
          </div>
          <div className="help-item">
            <strong>Unity:</strong> C# script for instant Unity integration
          </div>
          <div className="help-item">
            <strong>PDF:</strong> Full adventure module with NPCs and loot
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportPanel;