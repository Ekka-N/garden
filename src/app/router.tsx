import { createBrowserRouter } from 'react-router-dom'
import { PageLayout } from '@/app/layout/PageLayout'
import { HomePage } from '@/pages/home/HomePage'
import { PriceListPage } from '@/pages/price-list/PriceListPage'
import { RecommendationsPage } from '@/pages/recommendations/RecommendationsPage'

// import.meta.env.BASE_URL — это base из vite.config.ts ('/garden/' в сборке, '/' в dev).
// React Router ожидает basename без завершающего слэша.
const basename = import.meta.env.BASE_URL.replace(/\/$/, '')

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
