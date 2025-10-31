/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-blue': '#0A0A2E',      // Azul Noche (Principal)
        'brand-cream': '#F5EFE6',     // Crema Suave (Fondo)
        'brand-brown': '#6B240C',     // Marrón Chocolate (Títulos)
        'brand-gold': '#B39C4D',      // Dorado Waffle (Acentos)
        'brand-red': '#D81E2C',       // Rojo Cereza (Llamada a la acción)
      },
      fontFamily: {
        'display': ['var(--font-playfair-display)', 'serif'],
        'body': ['var(--font-montserrat)', 'sans-serif'],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },

      
    },
  },
  plugins: [],
};
