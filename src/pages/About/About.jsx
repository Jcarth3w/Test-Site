import AboutIntro from './components/AboutIntro';
import FirmHistory from './components/FirmHistory';
import FirmPrinciples from './components/FirmPrinciples';
import FirmStats from './components/FirmStats';
import './styles/About.css';

const About = () => {
  return (
    <div className="about-page">
      <AboutIntro />
      <FirmHistory />
      <FirmPrinciples />
      <FirmStats />
    </div>
  );
};

export default About;
