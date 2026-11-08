import type { PriceTable } from './types'

export const priceTables: PriceTable[] = [
  {
    id: 'stone-fruits',
    title: 'Цены на абрикосы и персики',
    updatedAt: '2026-10-01',
    rows: [
      {
        id: 'adriana',
        name: 'Адриана',
        ripening: 'конец июля',
        description: 'самоплодный',
        price: 600,
      },
      {
        id: 'vanila-kot',
        name: 'Ванила кот',
        ripening: 'середина июля',
        description: 'с румянцем',
        isNew: true,
        price: 600,
      },
      {
        id: 'krasnoshchekiy',
        name: 'Краснощекий',
        ripening: '20–30 июля',
        price: 500,
      },
      {
        id: 'manitoba',
        name: 'Манитоба',
        ripening: 'начало июля',
        description: 'Канадский сорт',
        price: 500,
      },
      {
        id: 'nelson',
        name: 'Нельсон',
        ripening: 'начало августа',
        price: null,
      },
      {
        id: 'khani-rich',
        name: 'Хани Рич',
        description: 'априум (слива+абрикос)',
        price: 600,
      },
    ],
  },
]
