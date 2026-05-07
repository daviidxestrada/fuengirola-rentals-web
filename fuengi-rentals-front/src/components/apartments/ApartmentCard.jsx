import { Link } from "react-router-dom";

import { getApartmentImages } from "../../utils";

function ApartmentCard({ apartment }) {
  const coverImage = getApartmentImages(apartment)[0];

  return (
    <Link to={`/apartments/${apartment._id}`} className="apt-card">
      <div className="apt-card-img" style={{ backgroundImage: `url(${coverImage})` }}>
        <span className="apt-card-img-tag">{apartment.city || "Fuengirola"}</span>
      </div>

      <div className="apt-card-body">
        <h3 className="apt-card-title">{apartment.title}</h3>
        <p className="apt-card-desc">{apartment.description}</p>
        <div className="apt-card-foot">
          <div className="apt-card-price">
            {apartment.price} EUR<small>/ noche</small>
          </div>
          <span className="apt-card-cta">Ver detalle</span>
        </div>
      </div>
    </Link>
  );
}

export default ApartmentCard;
