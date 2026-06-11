import { Link } from 'react-router-dom';
import { footerContent } from './footerContent';
import logo from '../assets/mll-white-logo-w-names.png';
import './styles/Footer.css';

const SocialIcon = ({ icon }) => {
  if (icon === 'linkedin') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="site-footer__social-icon">
        <path
          fill="currentColor"
          d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.124 2.062 2.062 0 0 1 0 4.124zM7.114 20.452H3.56V9h3.554v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="site-footer__social-icon">
      <path
        fill="currentColor"
        d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
      />
    </svg>
  );
};

const Footer = () => {
  const { tagline, navLinks, socialLinks, contactCta, copyright } = footerContent;

  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__grid">
          <div className="site-footer__brand">
            <Link to="/" className="site-footer__logo">
              <img src={logo} alt="McCoy Leavitt Laskey LLC" />
            </Link>
            <p className="site-footer__tagline">{tagline}</p>
          </div>

          <nav className="site-footer__nav" aria-label="Footer navigation">
            <h2 className="site-footer__heading">Explore</h2>
            <ul className="site-footer__nav-list">
              {navLinks.map((link) => (
                <li key={link.to}>
                  <Link to={link.to}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="site-footer__connect">
            <h2 className="site-footer__heading">Connect</h2>
            <div className="site-footer__social">
              {socialLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="site-footer__social-link"
                  aria-label={`Follow MLL Law on ${link.label}`}
                >
                  <SocialIcon icon={link.icon} />
                  <span>{link.label}</span>
                </a>
              ))}
            </div>
            <Link to={contactCta.to} className="site-footer__cta">
              {contactCta.label}
            </Link>
          </div>
        </div>

        <div className="site-footer__bottom">
          <p>{copyright}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
