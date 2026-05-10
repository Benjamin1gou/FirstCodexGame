import { defineConfig } from 'vite';

const phasermsg = () => {
  return {
    name: 'phasermsg',
    buildStart() {
      process.stdout.write('Building for production...\n');
    },
    buildEnd() {
      const line = '---------------------------------------------------------';
      const msg = '❤️❤️❤️ Tell us about your game! - games@phaser.io ❤️❤️❤️';
      process.stdout.write(`${line}\n${msg}\n${line}\n`);
      process.stdout.write('✨ Done ✨\n');
    }
  };
};

export default defineConfig({
  // 相対baseにして、GitHub Pagesのプロジェクト配下/カスタムドメイン直下の両方で動作させる。
  base: './',
  logLevel: 'warning',
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          phaser: ['phaser']
        }
      }
    },
    minify: 'terser'
  },
  server: {
    port: 8080
  },
  plugins: [phasermsg()]
});
