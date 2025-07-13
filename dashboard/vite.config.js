import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [react()],
    server: {
        port: 3000,
        open: true,
        host: true
    },
    build: {
        outDir: 'dist',
        sourcemap: true,
        rollupOptions: {
            output: {
                manualChunks: {
                    vendor: ['react', 'react-dom'],
                    router: ['react-router-dom'],
                    charts: ['chart.js', 'react-chartjs-2', 'recharts'],
                    maps: ['leaflet', 'react-leaflet'],
                    utils: ['axios', 'date-fns', 'clsx', 'tailwind-merge']
                }
            }
        }
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src'),
            '@components': path.resolve(__dirname, 'src/components'),
            '@pages': path.resolve(__dirname, 'src/pages'),
            '@hooks': path.resolve(__dirname, 'src/hooks'),
            '@utils': path.resolve(__dirname, 'src/utils'),
            '@services': path.resolve(__dirname, 'src/services'),
            '@stores': path.resolve(__dirname, 'src/stores'),
            '@assets': path.resolve(__dirname, 'src/assets'),
            '@styles': path.resolve(__dirname, 'src/styles')
        }
    },
    define: {
        'process.env': {}
    }
}); 