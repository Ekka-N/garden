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

Сайт: **https://sad-nikishin.ru** (домен на DNS-серверах Джино, хостинг — GitHub Pages).

Деплой автоматический: workflow `.github/workflows/deploy.yml` собирает проект и публикует `dist/` при каждом пуше в `main`. Также его можно запустить вручную: вкладка **Actions** → **Deploy to GitHub Pages** → **Run workflow**.

### Что нужно сделать один раз

1. **Settings → Pages → Custom domain**: вписать `sad-nikishin.ru`, сохранить и дождаться успешной проверки DNS.
2. Подтвердить владение доменом: GitHub покажет в этом же блоке TXT-запись вида `_github-pages-challenge-Ekka-N` — добавить её в DNS Джино.
3. Включить **Enforce HTTPS** (появится после выпуска сертификата, обычно до часа).
4. Сделать пуш в `main` — сайт обновится через пару минут.

### DNS в Джино

| Тип | Имя | Значение |
| --- | --- | --- |
| A | `@` (sad-nikishin.ru) | `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153` |
| CNAME | `www` | `ekka-n.github.io` |
| TXT | `_github-pages-challenge-Ekka-N` | токен из настроек Pages |

### Как учтён адрес сайта

- в `vite.config.ts` задан `base: '/'` (корень домена);
- `public/CNAME` содержит `sad-nikishin.ru`, чтобы домен сохранялся в артефакте сборки;
- пути к картинкам из `public/` строятся через хелпер `src/shared/lib/assetUrl.ts`;
- после сборки рядом с `index.html` создаются `404.html` (копия страницы, чтобы работали прямые ссылки на `/recommendations` и `/price-list`) и `.nojekyll`.

### Если репозиторий или домен поменяются

- Возврат на `https://<user>.github.io/<repo>/` → в `vite.config.ts` поставьте `BASE_PATH = '/<repo>/'`.
- Другой домен → обновите `BASE_PATH` (если это не корень), `public/CNAME` и DNS-записи.
