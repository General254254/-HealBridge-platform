/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    theme: {
        extend: {
            colors: {
                // Calming healthcare palette
                primary: {
                    50: '#f0f9f4',
                    100: '#d9f2e3',
                    200: '#b5e4c9',
                    300: '#84d0a8',
                    400: '#52b683',
                    500: '#2f9968',
                    600: '#207b53',
                    700: '#1b6244',
                    800: '#194e38',
                    900: '#16402f',
                },
                secondary: {
                    50: '#f0f5ff',
                    100: '#e0eaff',
                    200: '#c7d8fe',
                    300: '#a5bffc',
                    400: '#819bf8',
                    500: '#6477f1',
                    600: '#4a54e5',
                    700: '#3d43ca',
                    800: '#343aa3',
                    900: '#303581',
                },
                accent: {
                    50: '#fdf4f8',
                    100: '#fce8f3',
                    200: '#fbd0e8',
                    300: '#f9a8d4',
                    400: '#f472b6',
                    500: '#ec4899',
                    600: '#db2777',
                    700: '#be185d',
                    800: '#9d174d',
                    900: '#831843',
                },
                calm: {
                    50: '#f8fafc',
                    100: '#f1f5f9',
                    200: '#e2e8f0',
                    300: '#cbd5e1',
                    400: '#94a3b8',
                    500: '#64748b',
                    600: '#475569',
                    700: '#334155',
                    800: '#1e293b',
                    900: '#0f172a',
                },
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
                display: ['Outfit', 'Inter', 'sans-serif'],
            },
            animation: {
                'fade-in': 'fadeIn 0.5s ease-out',
                'slide-up': 'slideUp 0.3s ease-out',
                'pulse-soft': 'pulseSoft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { opacity: '0', transform: 'translateY(10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                pulseSoft: {
                    '0%, 100%': { opacity: '1' },
                    '50%': { opacity: '.7' },
                },
            },
        },
    },
    plugins: [
        require('@tailwindcss/forms'),
        require('@tailwindcss/typography'),
    ],
};
