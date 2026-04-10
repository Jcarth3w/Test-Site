import AboutBanner from './components/AboutBanner';
import FirmValues from './components/FirmValues';
import './styles/About.css';

const About = () => {
  return (
    <div className="about-page">
      <AboutBanner />
      <FirmValues />
      <footer className="footer">
        <div className="container">
          <p>&copy; 2024 MLL Law. All rights reserved.</p>
          <p>Contact us for a confidential case review.</p>
        </div>
      </footer>
    </div>
  );
};

export default About;
