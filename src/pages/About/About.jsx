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
          <p>© 2012 - 2026 McCoy Leavitt Laskey LLC | All Rights Reserved</p>
        </div>
      </footer>
    </div>
  );
};

export default About;
