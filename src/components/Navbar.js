import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          OptiMath
        </Link>
        <ul className="nav-menu">
          <li className="nav-item">
            <Link to="/linear-programming" className="nav-link">
              Linear Programming
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/combinatorial-optimization" className="nav-link">
              Combinatorial Optimization
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/non-linear-programming" className="nav-link">
              Non-Linear Programming
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/infinite-dimensional" className="nav-link">
              Infinite Dimensional
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Navbar; 