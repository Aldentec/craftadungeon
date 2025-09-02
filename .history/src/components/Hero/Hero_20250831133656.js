import React, { useState, useEffect } from 'react';
import './Hero.css';

const Hero = () => {
  const [currentFeature, setCurrentFeature] = useState(0);
  
  const features = [
    { icon: "🗺️", text: "Visual dungeon maps" },
    { icon: "⚔️", text: "Dynamic encounters" },
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
    <section className="hero">
      <div className="hero-background">
        <div className="hero-grid"></div>
        <div className="hero-particles"></div>
      </div>
      
      <div className="container">
        <div className="hero-content">
          <div className="hero-badge">
            <span className="badge-icon">✨</span>
            <span>Professional Edition • Powered by AI</span>
          </div>
          
          <h1 className="hero-title">
            Create Epic Dungeons
            <span className="hero-highlight"> Instantly</span>
          </h1>
          
          <p className="hero-description">
            Generate professional-grade dungeon layouts, encounters, NPCs, and loot tables 
            in seconds. Perfect for game developers and dungeon masters who demand quality 
            and speed.
          </p>
          
          <div className="hero-features">
            <div className="feature-carousel">
              {features.map((feature, index) => (
                <div 
                  key={index}
                  className={`feature-item ${index === currentFeature ? 'active' : ''}`}
                >
                  <span className="feature-icon">{feature.icon}</span>
                  <span className="feature-text">{feature.text}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="hero-actions">
            <button 
              className="btn-hero-primary"
              onClick={scrollToGenerator}
            >
              <span className="btn-icon">🚀</span>
              Start Creating
              <div className="btn-shine"></div>
            </button>
            
            <button className="btn-hero-secondary">
              <span className="btn-icon">▶️</span>
              Watch Demo
            </button>
          </div>
          
          <div className="hero-stats">
            <div className="stat-item">
              <div className="stat-number">10K+</div>
              <div className="stat-label">Dungeons Generated</div>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <div className="stat-number">500+</div>
              <div className="stat-label">Game Developers</div>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <div className="stat-number">50K+</div>
              <div className="stat-label">NPCs Created</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;