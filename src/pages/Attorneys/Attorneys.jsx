import AttorneyIntro from './components/AttorneyIntro';
import AttorneyList from './components/AttorneyList';
import './styles/Attorneys.css';

const Attorneys = () => {
  return (
    <div className="attorneys-page">
      <AttorneyIntro />
      <AttorneyList />
      <footer className="footer">
        <div className="container">
          <p>© 2012 - 2026 McCoy Leavitt Laskey LLC | All Rights Reserved</p>
        </div>
      </footer>
    </div>
  );
};

export default Attorneys;
