export default function LocalBusinessSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    "name": "Zonaf Crep's Mojor",
    "image": "https://zonafcrepsmojor.ec/logoheader.jpg",
    "description": "Crepes, waffles, frappés y helados en Machachi. Un viaje de sabores.",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Av Pablo Guarderas y Velasco Ibarra",
      "addressLocality": "Machachi",
      "addressRegion": "Pichincha",
      "addressCountry": "EC"
    },
    "telephone": "+593995676238",
    "openingHours": "Mo-Su 12:00-20:30",
    "servesCuisine": ["Crepes", "Waffles", "Helados", "Bebidas"],
    "url": "https://zonafcrepsmojor.ec",
    "priceRange": "$$"
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
