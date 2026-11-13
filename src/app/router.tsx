import { createBrowserRouter } from 'react-router-dom'
import { PageLayout } from '@/app/layout/PageLayout'
import { HomePage } from '@/pages/home/HomePage'
import { PriceListPage } from '@/pages/price-list/PriceListPage'
import { RecommendationsPage } from '@/pages/recommendations/RecommendationsPage'

// import.meta.env.BASE_URL — это base из vite.config.ts ('/' при деплое на своём домене).
// В корне домена basename не нужен, поэтому передаём undefined.
const baseUrl = import.meta.env.BASE_URL.replace(/\/$/, '')
const basename = baseUrl === '' ? undefined : baseUrl

export const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <PageLayout />,
      children: [
        { index: true, element: <HomePage /> },
        { path: 'recommendations', element: <RecommendationsPage /> },
        { path: 'price-list', element: <PriceListPage /> },
      ],
    },
  ],
  { basename },
)
