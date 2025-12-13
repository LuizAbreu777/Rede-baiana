/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    screens: {
      'xs': '480px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        // Cores da Bandeira da Bahia
        bahia: {
          vermelho: '#D52B1E',
          azul: '#00529F',
          branco: '#FFFFFF',
          // Variações
          vermelhoEscuro: '#B01F16',
          vermelhoClaro: '#FF4136',
          azulEscuro: '#003D73',
          azulClaro: '#1E90FF',
        },
        // Status da rede
        status: {
          online: '#10B981',
          offline: '#EF4444',
          congestionado: '#F59E0B',
          comprometido: '#8B5CF6',
          manutencao: '#6B7280',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px currentColor, 0 0 10px currentColor' },
          '100%': { boxShadow: '0 0 20px currentColor, 0 0 30px currentColor' },
        },
      },
      backgroundImage: {
        'bahia-gradient': 'linear-gradient(135deg, #00529F 0%, #D52B1E 50%, #00529F 100%)',
        'bahia-diagonal': 'linear-gradient(45deg, #D52B1E 25%, #FFFFFF 25%, #FFFFFF 50%, #00529F 50%, #00529F 75%, #FFFFFF 75%)',
      },
    },
  },
  plugins: [],
}

