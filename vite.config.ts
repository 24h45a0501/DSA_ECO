import { defineConfig, type PluginOption } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(async () => {
  const plugins: PluginOption[] = [react(), tailwindcss()];

  try {
    // @ts-expect-error Optional local helper is not typed in this workspace.
    const sourceTagsModule = (await import('./.vite-source-tags.js')) as {
      sourceTags?: () => PluginOption;
    };
    if (typeof sourceTagsModule.sourceTags === 'function') {
      plugins.push(sourceTagsModule.sourceTags());
    }
  } catch (error) {
    void error;
  }

  return {
    plugins,
    build: {
      rollupOptions: {
        output: {
          manualChunks(id: string) {
            if (!id.includes('node_modules')) {
              return;
            }
            if (id.includes('react') || id.includes('scheduler')) {
              return 'react-vendor';
            }
            if (id.includes('recharts') || id.includes('d3-')) {
              return 'charts';
            }
            if (id.includes('framer-motion')) {
              return 'motion';
            }
            if (id.includes('lucide-react')) {
              return 'icons';
            }
          },
        },
      },
    },
  };
})
