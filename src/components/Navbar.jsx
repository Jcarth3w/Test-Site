import { useState } from 'react';
import { Link } from 'react-router-dom';
import './styles/Navbar.css';
import logo from '../assets/mll-white-logo-w-names.png';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="logo">
          <img src={logo} alt="MLL Law Logo" />
        </Link>
        <button className="mobile-toggle" onClick={() => setIsOpen(!isOpen)} aria-label="Toggle menu">
          ☰
        </button>
        <ul className={`nav-links ${isOpen ? 'open' : ''}`}>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/about">About</Link></li>
          <li><Link to="/attorneys">Attorneys</Link></li>
          <li><Link to="/practice">Practice Areas</Link></li>
          <li><Link to="/articles">Articles</Link></li>
          <li><Link to="/results">Results</Link></li>
          <li><Link to="/contact" className="cta">Free Case Review</Link></li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
