import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const deploymentVersionPlugin = {
  name: 'deployment-version',

  generateBundle() {
    const commit = process.env.VERCEL_GIT_COMMIT_SHA || 'local';

    this.emitFile({
      type: 'asset',
      fileName: 'version.json',
      source: JSON.stringify({ commit }),
    });
  },
};

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), deploymentVersionPlugin],
})