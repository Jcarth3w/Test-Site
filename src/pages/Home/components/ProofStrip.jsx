import '../styles/ProofStrip.css';

const ProofStrip = ({ items }) => {
  return (
    <section className="home-proof-strip">
      <div className="container">
        <div className="proof-grid">
          {items.map((item) => (
            <div key={item.value} className="proof-item">
              <strong>{item.value}</strong>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProofStrip;
