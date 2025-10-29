// tailwind.config.js
module.exports = {
     content: [
    "./src/app/**/*.{js,jsx,ts,tsx}",      // ✅ includes layout, pages
    "./src/components/**/*.{js,jsx,ts,tsx}" // ✅ includes Header, Footer
  ],
  theme: {
    extend: {
      fontFamily: {
        'playwrite-de': ['"Playwrite DE SAS"', 'cursive'], // ✅ must match Google's technical name
      },
      
    },
  },
};