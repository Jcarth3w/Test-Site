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
          <p>&copy; 2024 MLL Law. All rights reserved.</p>
          <p>Contact us to schedule an attorney consultation.</p>
        </div>
      </footer>
    </div>
  );
};

export default Attorneys;
