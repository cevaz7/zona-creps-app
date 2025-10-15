// src/app/components/AboutSection.tsx
export default function AboutSection() {
  return (
    <section id="about" className="py-16 bg-gradient-to-br from-rose-50 to-amber-50">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Sobre Nosotros
            </h2>
            <div className="w-24 h-1 bg-rose-500 mx-auto"></div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">
                  Nuestra Historia
                </h3>
                <p className="text-gray-600 mb-4">
                  En <span className="text-rose-600 font-semibold">CrepeDelicia</span> comenzamos con una simple pasión: crear los crepes más deliciosos que hayas probado. Lo que empezó como un pequeño puesto en una feria local se ha convertido en el destino favorito para los amantes de los postres.
                </p>
                <p className="text-gray-600 mb-6">
                  Utilizamos solo ingredientes frescos y de la más alta calidad, combinando técnicas tradicionales con creativas innovaciones para ofrecerte una experiencia única en cada bocado.
                </p>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-rose-600">5+</div>
                    <div className="text-gray-600">Años de Experiencia</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-rose-600">50+</div>
                    <div className="text-gray-600">Crepes Únicos</div>
                  </div>
                </div>
                
                <button className="bg-rose-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-rose-600 transition-colors">
                  Conoce Más
                </button>
              </div>
              
              <div className="relative">
                <div className="bg-gradient-to-r from-rose-400 to-orange-300 rounded-2xl h-64 md:h-80 flex items-center justify-center">
                  <div className="text-white text-center">
                    <svg className="w-20 h-20 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM6.75 9.25a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5h-6.5z" clipRule="evenodd" />
                    </svg>
                    <span className="text-lg">Imagen de nuestra tienda</span>
                  </div>
                </div>
                <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-amber-200 rounded-2xl"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}