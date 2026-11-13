# Саженцы из Поповки

Лендинг питомника на Vite + React. Деплой — на GitHub Pages.

## Локальная разработка

```bash
npm install
npm run dev      # http://localhost:5173/
npm run build    # сборка в dist/
npm run preview  # проверить сборку локально
npm test         # тесты (vitest, watch-режим)
```

## Деплой на GitHub Pages

Сайт: **https://ekka-n.github.io/garden/**

Деплой автоматический: workflow `.github/workflows/deploy.yml` собирает проект и публикует `dist/` при каждом пуше в `main`. Также его можно запустить вручную: вкладка **Actions** → **Deploy to GitHub Pages** → **Run workflow**.

### Что нужно сделать один раз

1. Запушить репозиторий на GitHub (ветка `main`).
2. Открыть **Settings → Pages** и в блоке **Build and deployment** выбрать источник **GitHub Actions**.
3. Сделать пуш в `main` — сайт появится через пару минут.

### Как учтён адрес проекта

Проект живёт не в корне домена, а по пути `/garden/`, поэтому:

- в `vite.config.ts` задан `base: '/garden/'` для сборки (в dev-режиме остаётся `/`);
- `src/app/router.tsx` передаёт этот base в `basename` роутера;
- пути к картинкам из `public/` строятся через хелпер `src/shared/lib/assetUrl.ts`;
- после сборки рядом с `index.html` создаются `404.html` (копия страницы, чтобы работали прямые ссылки на `/recommendations` и `/price-list`) и `.nojekyll`.

### Если репозиторий или домен поменяются

- Другой репозиторий → измените `BASE_PATH` в `vite.config.ts` на `/<имя-репозитория>/`.
- Свой домен (`username.github.io` или кастомный) → поставьте `BASE_PATH = '/'`.
