import { createBrowserRouter } from 'react-router-dom'
import { PageLayout } from '@/app/layout/PageLayout'
import { HomePage } from '@/pages/home/HomePage'
import { PriceListPage } from '@/pages/price-list/PriceListPage'
import { RecommendationsPage } from '@/pages/recommendations/RecommendationsPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <PageLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'recommendations', element: <RecommendationsPage /> },
      { path: 'price-list', element: <PriceListPage /> },
    ],
  },
])
