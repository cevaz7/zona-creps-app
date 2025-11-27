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
                  Desde la imaginación logramos plasmar <span className="text-brand-brown font-semibold">“un viaje de sabores”</span> que fusiona a nuestro Ecuador con el encanto del mundo.
                  Inspirado en la magia de los sabores y las culturas que nos transporta desde la majestuosidad del volcán Cotopaxi y los eternos ilinizas hacia las calles románticas de París, uniendo paisajes, tradiciones y gastronomía.
                </p>
                <p className="text-gray-700 mb-6">
                  El inigualable sabor del café humeante nos envuelve con su aroma y sabor, mientras las fresas emergen como símbolo de la dulzura y frescura de nuestra tierra.
                  La esencia chacarera y la fe religiosa enaltecen la identidad en la capital mundial del chagra, mientras un avión cruza los cielos recordándonos que los sabores pueden llevarse lejos, sin salir de este único lugar.
                  Esta obra no solo decora el espacio, sino que invita a soñar, viajar con el paladar y a descubrir que cada bocado es una nueva aventura y una nueva oportunidad.
                                  </p>
                <a href="#" className="bg-brand-brown text-white px-8 py-3 rounded-full font-bold hover:bg-brand-blue transition-colors shadow-lg">
                  Conoce Más
                </a>
              </div>
              
              <div className="relative h-80 rounded-2xl overflow-hidden shadow-lg">
                <Image 
                  src="/local/local-creps.jpg" 
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
