/**
 * Собирает путь к файлу из public/ с учётом base из vite.config.ts.
 * Пример: assetUrl('/images/foto.jpg') → '/garden/images/foto.jpg' в сборке.
 */
export const assetUrl = (path: string): string =>
  `${import.meta.env.BASE_URL}${path.replace(/^\/+/, '')}`
