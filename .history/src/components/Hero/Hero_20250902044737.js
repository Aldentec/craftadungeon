import React, { useState, useEffect } from 'react';
import './Hero.css';

const Hero = () => {
  const [currentFeature, setCurrentFeature] = useState(0);
  
  const features = [
    { icon: "🗺️", text: "Professional dungeon maps" },
    { icon: "⚔️", text: "Dynamic D&D encounters" },
    { icon: "👥", text: "AI-generated NPCs" },
    { icon: "💎", text: "Smart loot tables" },
    { icon: "🎲", text: "Seed-based generation" },
    { icon: "📱", text: "Multi-format export" }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 2000);
    
    return () => clearInterval(interval);
  }, [features.length]);

  const scrollToGenerator = () => {
    const generatorSection = document.querySelector('.main-content');
    generatorSection?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="hero" role="banner">
      <div className="hero-background" aria-hidden="true">
        <div className="hero-grid"></div>
        <div className="hero-particles"></div>
      </div>
      
      <div className="container">
        <div className="hero-content">
          <div className="hero-badge">
            <span className="badge-icon">✨</span>
            <span>AI-Powered • Free D&D Tool</span>
          </div>
          
          <h1 className="hero-title">
            Craft Epic D&D Dungeons
            <span className="hero-highlight"> Instantly</span>
          </h1>
          
          <p className="hero-description">
            Generate professional-grade D&D dungeon layouts, encounters, NPCs, and loot tables 
            in seconds. Perfect for Dungeon Masters, game developers, and RPG enthusiasts who demand quality 
            and speed. Start creating your next adventure now.
          </p>
          
          <div className="hero-features" role="list" aria-label="Key features">
            <div className="feature-carousel">
              {features.map((feature, index) => (
                <div 
                  key={index}
                  className={`feature-item ${index === currentFeature ? 'active' : ''}`}
                  role="listitem"
                  aria-label={feature.text}
                >
                  <span className="feature-icon" aria-hidden="true">{feature.icon}</span>
                  <span className="feature-text">{feature.text}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="hero-actions">
            <button 
              className="btn-hero-primary"
              onClick={scrollToGenerator}
              aria-label="Start creating your D&D dungeon now"
            >
              <span className="btn-icon" aria-hidden="true">🚀</span>
              Start Creating Free
              <div className="btn-shine" aria-hidden="true"></div>
            </button>
          </div>

          <div className="hero-stats" role="list" aria-label="Usage statistics">
            <div className="stat-item" role="listitem">
              <div className="stat-number">25K+</div>
              <div className="stat-label">Dungeons Generated</div>
            </div>
            <div className="stat-divider" aria-hidden="true"></div>
            <div className="stat-item" role="listitem">
              <div className="stat-number">1,200+</div>
              <div className="stat-label">Dungeon Masters</div>
            </div>
            <div className="stat-divider" aria-hidden="true"></div>
            <div className="stat-item" role="listitem">
              <div className="stat-number">100K+</div>
              <div className="stat-label">NPCs Created</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;