// src/components/AboutSection.tsx
import Image from 'next/image';

export default function AboutSection() {
  return (
    <section id="about" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display text-4xl md:text-5xl font-bold text-brand-brown mb-4">
              Nuestra Esencia
            </h2>
            <div className="w-24 h-1.5 bg-brand-gold mx-auto rounded-full"></div>
          </div>

          <div className="bg-brand-cream rounded-2xl shadow-xl p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-10 items-center">
              <div>
                <h3 className="font-display text-3xl font-bold text-brand-blue mb-4">
                  Más que Postres, Creamos Momentos
                </h3>
                <p className="text-gray-700 mb-4">
                  En <span className="text-brand-brown font-semibold">ZONA CREP'S</span>, comenzamos con una simple pasión: crear los postres más deliciosos que hayas probado. Lo que empezó como un sueño se ha convertido en el destino favorito para los amantes de las crepes.
                </p>
                <p className="text-gray-700 mb-6">
                  Utilizamos solo ingredientes frescos y de la más alta calidad, combinando técnicas tradicionales con creativas innovaciones para ofrecerte una experiencia única en cada bocado.
                </p>
                <a href="#" className="bg-brand-brown text-white px-8 py-3 rounded-full font-bold hover:bg-brand-blue transition-colors shadow-lg">
                  Conoce Más
                </a>
              </div>
              
              <div className="relative h-80 rounded-2xl overflow-hidden shadow-lg">
                <Image 
                  src="/local/localcreps.jpg" 
                  alt="Local de Zonaf Creps" 
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
