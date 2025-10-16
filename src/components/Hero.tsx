// src/components/Hero.tsx
export default function Hero() {
  return (
    <section className="relative bg-brand-blue text-white py-24 md:py-32">
      <div className="container mx-auto px-4 text-center relative z-10">
        <h1 className="font-display text-5xl md:text-7xl font-bold mb-6 drop-shadow-lg">
          Un Viaje de Sabores..!
        </h1>
        <p className="text-xl md:text-2xl mb-10 max-w-3xl mx-auto font-light text-brand-cream">
          Descubre la experiencia única de nuestros crepes, waffles y postres artesanales, preparados con pasión y los mejores ingredientes.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a href="#menu" className="bg-brand-red text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-red-700 transition-colors shadow-xl">
            Ver Menú
          </a>
          <button className="border-2 border-brand-gold text-brand-gold px-8 py-4 rounded-full font-bold text-lg hover:bg-brand-gold hover:text-brand-blue transition-colors">
            Pedir Ahora
          </button>
        </div>
      </div>
      
      {/* Overlay sutil para oscurecer una futura imagen de fondo */}
      <div className="absolute top-0 left-0 w-full h-full bg-black/30"></div>
       {/* Aquí podrías agregar una imagen de fondo en el futuro */}
    </section>
  );
}
