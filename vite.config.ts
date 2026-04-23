import fs from 'node:fs'
import path from 'path'
import { fileURLToPath } from 'node:url'
import { defineConfig, type Plugin } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

const rootDir = path.dirname(fileURLToPath(import.meta.url))
const repairPublicDir = path.join(rootDir, 'public', 'repair')

/**
 * `public/repair`는 프로덕션에서 별도 SPA로 쓰이지만, dev에서는 루트 앱이
 * `/repair`를 가로채 404가 납니다. 빌드 산출물이 있을 때만 index.html로 넘깁니다.
 */
function repairSpaDevFallback(): Plugin {
  return {
    name: 'repair-spa-dev-fallback',
    configureServer(server) {
      return () => {
        server.middlewares.use((req, _res, next) => {
          if (req.method !== 'GET' && req.method !== 'HEAD') return next()
          const raw = req.url ?? ''
          const pathname = raw.split('?')[0] ?? ''
          if (!pathname.startsWith('/repair')) return next()
          if (pathname === '/repair/index.html') return next()

          const lastSeg = pathname.split('/').pop() ?? ''
          if (lastSeg.includes('.')) return next()

          const indexFile = path.join(repairPublicDir, 'index.html')
          if (!fs.existsSync(indexFile)) return next()

          const q = raw.includes('?') ? `?${raw.split('?').slice(1).join('?')}` : ''
          req.url = `/repair/index.html${q}`
          next()
        })
      }
    },
  }
}

function figmaAssetResolver() {
  return {
    name: 'figma-asset-resolver',
    resolveId(id) {
      if (id.startsWith('figma:asset/')) {
        const filename = id.replace('figma:asset/', '')
        return path.resolve(rootDir, 'src/assets', filename)
      }
    },
  }
}

export default defineConfig({
  plugins: [
    repairSpaDevFallback(),
    figmaAssetResolver(),
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(rootDir, './src'),
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],
})
