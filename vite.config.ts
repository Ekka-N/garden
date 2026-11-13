import { copyFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath, URL } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'

// GitHub Pages отдаёт проект по корню домена sad-nikishin.ru.
// Если когда-нибудь понадобится вернуться на https://<user>.github.io/<repo>/,
// достаточно заменить '/' на '/<repo>/'.
const BASE_PATH = '/'

const distDir = fileURLToPath(new URL('./dist', import.meta.url))

// GitHub Pages не умеет отдавать index.html для клиентских роутов SPA,
// поэтому кладём его копию в 404.html — Pages покажет её на любой неизвестный путь.
function spaFallback(): Plugin {
  return {
    name: 'spa-fallback-404',
    apply: 'build',
    closeBundle() {
      copyFileSync(join(distDir, 'index.html'), join(distDir, '404.html'))
      // Отключает обработку артефактов Jekyll — иначе часть файлов может не попасть на сайт.
      writeFileSync(join(distDir, '.nojekyll'), '')
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  // В dev-режиме сайт живёт в корне (http://localhost:5173/), в сборке — под BASE_PATH.
  base: command === 'build' ? BASE_PATH : '/',
  plugins: [react(), spaFallback()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
}))
