import React from 'react';
import './Header.css';

const Header = () => {
  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <div className="logo-section">
            <a href="/" className="logo" aria-label="CraftADungeon - Home">
              <span className="logo-icon">⚔️</span>
              <span className="logo-text">CraftADungeon</span>
            </a>
            <span className="logo-tagline">AI Dungeon Generator</span>
          </div>
          
          <nav className="nav" role="navigation" aria-label="Main navigation">
            <a href="#generator" className="nav-link" aria-label="Dungeon Generator Tool">
              <span className="nav-icon">🎲</span>
              Generator
            </a>
            <a href="#docs" className="nav-link" aria-label="Documentation and Guides">
              <span className="nav-icon">📖</span>
              Docs
            </a>
            <a href="#api" className="nav-link" aria-label="API Documentation">
              <span className="nav-icon">⚡</span>
              API
            </a>
            <div className="nav-divider"></div>
            <button className="btn-secondary" aria-label="Save current dungeon project">
              <span className="btn-icon">💾</span>
              Save Project
            </button>
            <button className="btn-primary" aria-label="Export all dungeon data">
              <span className="btn-icon">🚀</span>
              Export All
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;