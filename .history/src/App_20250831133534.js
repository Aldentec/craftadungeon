import React, { useState, useCallback } from 'react';
import Header from './components/Header/Header';
import Hero from './components/Hero/Hero';
import ControlsPanel from './components/ControlsPanel/ControlsPanel';
import DungeonDisplay from './components/DungeonDisplay/DungeonDisplay';
import ExportPanel from './components/ExportPanel/ExportPanel';
import { generateDungeon } from './utils/dungeonGenerator';
import { generateNPCs } from './utils/npcGenerator';
import { generateLoot } from './utils/lootGenerator';
import './App.css';

function App() {
  const [dungeonData, setDungeonData] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentParams, setCurrentParams] = useState({
    seed: '',
    width: 20,
    height: 20,
    difficulty: 'medium',
    biome: 'dungeon',
    roomCount: 8,
    corridorWidth: 1,
    enableAI: true
  });

  const handleGenerate = useCallback(async (params) => {
    setIsGenerating(true);
    setCurrentParams(params);
    
    try {
      // Generate core dungeon structure
      const dungeon = generateDungeon(params);
      
      // Generate NPCs and loot if AI is enabled
      const npcs = params.enableAI ? generateNPCs(dungeon, params) : [];
      const loot = generateLoot(dungeon, params);
      
      // Simulate AI processing delay for realism
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const generatedData = {
        ...dungeon,
        npcs,
        loot,
        metadata: {
          generatedAt: new Date().toISOString(),
          seed: params.seed,
          parameters: params
        }
      };
      
      setDungeonData(generatedData);
    } catch (error) {
      console.error('Generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  }, []);

  return (
    <div className="App">
      <Header />
      <Hero />
      <main className="main-content">
        <div className="container">
          <div className="app-grid">
            <div className="sidebar">
              <ControlsPanel 
                onGenerate={handleGenerate}
                isGenerating={isGenerating}
                initialParams={currentParams}
              />
              {dungeonData && (
                <ExportPanel 
                  dungeonData={dungeonData}
                  params={currentParams}
                />
              )}
            </div>
            <div className="content-area">
              <DungeonDisplay 
                dungeonData={dungeonData}
                isGenerating={isGenerating}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;