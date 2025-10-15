// src/app/components/Hero.tsx
export default function Hero() {
  return (
    <section className="relative bg-gradient-to-r from-rose-400 to-orange-300 text-white py-20 md:py-28">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          Deliciosos Crepes & Postres
        </h1>
        <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto">
          Descubre el sabor único de nuestros crepes artesanales, preparados con los mejores ingredientes
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="bg-white text-rose-600 px-8 py-3 rounded-full font-semibold hover:bg-rose-50 transition-colors shadow-lg">
            Ver Menú
          </button>
          <button className="border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white hover:text-rose-600 transition-colors">
            Pedir Ahora
          </button>
        </div>
      </div>
      
      {/* Elementos decorativos */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full"></div>
        <div className="absolute -bottom-20 -left-10 w-60 h-60 bg-white/10 rounded-full"></div>
      </div>
    </section>
  );
}