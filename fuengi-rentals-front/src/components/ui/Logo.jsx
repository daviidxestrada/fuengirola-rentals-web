function Logo({ inverted = false }) {
  return (
    <span className={`logo${inverted ? " logo-inverted" : ""}`}>
      <span className="logo-text">
        <span className="logo-text-main">Fuengirola</span>
        <span className="logo-text-sub">Rentals</span>
      </span>
    </span>
  );
}

export default Logo;
