import { createBrowserRouter } from 'react-router-dom'
import { PageLayout } from '@/app/layout/PageLayout'
import { HomePage } from '@/pages/home/HomePage'
import { PriceListPage } from '@/pages/price-list/PriceListPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <PageLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'price-list', element: <PriceListPage /> },
    ],
  },
])
