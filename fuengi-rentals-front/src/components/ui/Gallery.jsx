import { useState } from "react";

function Gallery({ images, title }) {
  const [index, setIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const visibleImages = images.slice(0, 5);

  const openLightbox = (nextIndex) => {
    setIndex(nextIndex);
    setLightboxOpen(true);
  };

  const showPrevious = (event) => {
    event.stopPropagation();
    setIndex((currentIndex) => (currentIndex - 1 + images.length) % images.length);
  };

  const showNext = (event) => {
    event.stopPropagation();
    setIndex((currentIndex) => (currentIndex + 1) % images.length);
  };

  return (
    <div className="gallery">
      <div className="gallery-grid">
        <button
          type="button"
          className="gallery-main"
          onClick={() => openLightbox(0)}
          style={{ backgroundImage: `url(${visibleImages[0]})` }}
          aria-label={title}
        >
          <span className="gallery-zoom">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M3 8V3h5" />
              <path d="M21 8V3h-5" />
              <path d="M3 16v5h5" />
              <path d="M21 16v5h-5" />
            </svg>
            {images.length} fotos
          </span>
        </button>

        <div className="gallery-side">
          {visibleImages.slice(1).map((image, imageIndex) => (
            <button
              type="button"
              key={`${image}-${imageIndex}`}
              className="gallery-thumb"
              onClick={() => openLightbox(imageIndex + 1)}
              style={{ backgroundImage: `url(${image})` }}
              aria-label={`Foto ${imageIndex + 2}`}
            />
          ))}
        </div>
      </div>

      {lightboxOpen ? (
        <div className="lightbox" onClick={() => setLightboxOpen(false)} role="presentation">
          <button
            type="button"
            className="lightbox-close"
            onClick={(event) => {
              event.stopPropagation();
              setLightboxOpen(false);
            }}
            aria-label="Cerrar"
          >
            x
          </button>
          <button type="button" className="lightbox-nav prev" onClick={showPrevious} aria-label="Anterior">
            {"<"}
          </button>
          <img src={images[index]} alt="" onClick={(event) => event.stopPropagation()} />
          <button type="button" className="lightbox-nav next" onClick={showNext} aria-label="Siguiente">
            {">"}
          </button>
          <span className="lightbox-counter">
            {index + 1} / {images.length}
          </span>
        </div>
      ) : null}
    </div>
  );
}

export default Gallery;
