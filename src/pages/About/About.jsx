import AboutBanner from './components/AboutBanner';
import OurMission from './components/OurMission';
import FirmValues from './components/FirmValues';
import './styles/About.css';

const About = () => {
  return (
    <div className="about-page">
      <AboutBanner />
      <OurMission />
      <FirmValues />
      <footer className="footer">
        <div className="container">
          <p>© 2013 - 2026 McCoy Leavitt Laskey LLC | All Rights Reserved</p>
        </div>
      </footer>
    </div>
  );
};

export default About;
