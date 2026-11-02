import type { PriceTable } from '@/entities/price-list/model/types'

export const priceTables: PriceTable[] = [
  {
    id: 'conifers',
    title: 'Хвойные саженцы',
    updatedAt: '2026-10-15T10:00:00.000Z',
    rows: [
      {
        id: 'pine',
        name: 'Сосна обыкновенная',
        age: '2 года',
        height: '20–40 см',
        price: 450,
        unit: 'шт',
      },
      {
        id: 'spruce',
        name: 'Ель колючая',
        age: '3 года',
        height: '40–60 см',
        price: 1200,
        unit: 'шт',
      },
      {
        id: 'thuja',
        name: 'Туя западная',
        age: '2 года',
        height: '30–50 см',
        price: 650,
        unit: 'саженец',
      },
    ],
  },
]
