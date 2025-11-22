import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig(({ command }) => {
  const isProduction = command === 'build';

  return {
    base: isProduction ? '/virtual-front/' : '/',
    build: {
      outDir: 'dist',
    },
  };
});
