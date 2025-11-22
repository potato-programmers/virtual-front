import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  // GitHub Pages 배포를 위한 base 경로 설정
  // 'virtual-front'를 실제 GitHub 리포지토리 이름으로 변경하세요.
  base: import.meta.env.PROD ? '/virtual-front/' : '/',
  build: {
    outDir: 'dist',
  },
});
