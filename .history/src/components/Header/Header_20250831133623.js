import React from 'react';
import './Header.css';

const Header = () => {
  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <div className="logo-section">
            <a href="/" className="logo">
              <span className="logo-icon">⚔️</span>
              <span className="logo-text">AI Dungeon Crafter</span>
            </a>
            <span className="logo-tagline">Professional Edition</span>
          </div>
          
          <nav className="nav">
            <a href="#generator" className="nav-link">
              <span className="nav-icon">🎲</span>
              Generator
            </a>
            <a href="#docs" className="nav-link">
              <span className="nav-icon">📖</span>
              Docs
            </a>
            <a href="#api" className="nav-link">
              <span className="nav-icon">⚡</span>
              API
            </a>
            <div className="nav-divider"></div>
            <button className="btn-secondary">
              <span className="btn-icon">💾</span>
              Save Project
            </button>
            <button className="btn-primary">
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