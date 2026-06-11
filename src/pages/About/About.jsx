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
    </div>
  );
};

export default About;
