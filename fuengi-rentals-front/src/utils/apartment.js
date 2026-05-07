export const HERO_IMAGE =
  "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=2000&q=80&auto=format&fit=crop";

export const BENEFITS_IMAGE =
  "https://images.unsplash.com/photo-1564540583246-934409427776?w=1200&q=80&auto=format&fit=crop";

export const AUTH_IMAGE =
  "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=1400&q=80&auto=format&fit=crop";

export const NOT_FOUND_IMAGE =
  "https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=1400&q=80&auto=format&fit=crop";

export const FALLBACK_APARTMENT_IMAGES = [
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1400&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1400&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1400&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1400&q=80&auto=format&fit=crop",
];

export const DEFAULT_FEATURES = [
  "Cerca de la playa",
  "Calendario actualizado",
  "Solicitud directa",
  "Gestion familiar",
];

export const getApartmentImages = (apartment) => {
  const images = Array.isArray(apartment?.images)
    ? apartment.images.filter(Boolean)
    : [];

  return images.length > 0 ? images : FALLBACK_APARTMENT_IMAGES;
};

export const getApartmentFeatures = (apartment) => {
  const features = Array.isArray(apartment?.features)
    ? apartment.features.filter(Boolean)
    : [];

  return features.length > 0 ? features : DEFAULT_FEATURES;
};
