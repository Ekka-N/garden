import { describe, expect, it } from 'vitest'
import type { PriceCategory, PriceRow } from '../model/types'
import {
  filterRows,
  getCategorySummary,
  getVisibleGroups,
  getVisibleRows,
  searchCategories,
  sortRows,
} from './selectors'

const rows: PriceRow[] = [
  { id: 'apple', name: 'Яблоко', price: 500 },
  { id: 'apricot', name: 'Абрикос', price: null },
  { id: 'pear', name: 'Груша', price: 300 },
]

const groupedCategory: PriceCategory = {
  id: 'grouped',
  title: 'Группированная категория',
  updatedAt: '2026-01-01',
  rows: [],
  groups: [
    {
      id: 'first',
      title: 'Первая группа',
      rows: [
        { id: 'one', name: 'Первый', price: 500 },
        { id: 'two', name: 'Второй', price: null },
      ],
    },
    {
      id: 'second',
      title: 'Вторая группа',
      rows: [{ id: 'three', name: 'Третий', price: null }],
    },
  ],
}

describe('getCategorySummary', () => {
  it('считает наличие, новинки и диапазон цен', () => {
    const category: PriceCategory = {
      id: 'category',
      title: 'Категория',
      updatedAt: '2026-01-01',
      rows: [
        { id: 'a', name: 'А', price: 500, isNew: true },
        { id: 'b', name: 'Б', price: 300 },
        { id: 'c', name: 'В', price: null },
      ],
    }

    expect(getCategorySummary(category)).toEqual({
      total: 3,
      inStock: 2,
      soldOut: 1,
      isNew: 1,
      minPrice: 300,
      maxPrice: 500,
    })
  })

  it('учитывает строки внутри групп', () => {
    const summary = getCategorySummary(groupedCategory)

    expect(summary.total).toBe(3)
    expect(summary.inStock).toBe(1)
    expect(summary.minPrice).toBe(500)
    expect(summary.maxPrice).toBe(500)
  })

  it('возвращает null для цены, если всё продано', () => {
    const category: PriceCategory = {
      id: 'sold',
      title: 'Проданные',
      updatedAt: '2026-01-01',
      rows: [{ id: 'a', name: 'А', price: null }],
    }

    expect(getCategorySummary(category).minPrice).toBeNull()
    expect(getCategorySummary(category).maxPrice).toBeNull()
  })
})

describe('filterRows', () => {
  it('скрывает проданные сорта', () => {
    expect(filterRows(rows, true).map((row) => row.id)).toEqual(['apple', 'pear'])
  })

  it('возвращает все строки без фильтра', () => {
    expect(filterRows(rows, false)).toHaveLength(3)
  })
})

describe('sortRows', () => {
  it('сортирует по возрастанию цены и оставляет проданные в конце', () => {
    expect(sortRows(rows, 'price-asc').map((row) => row.price)).toEqual([
      300,
      500,
      null,
    ])
  })

  it('сортирует по убыванию цены и оставляет проданные в конце', () => {
    expect(sortRows(rows, 'price-desc').map((row) => row.price)).toEqual([
      500,
      300,
      null,
    ])
  })

  it('не меняет исходный массив', () => {
    const original = rows.map((row) => row.id)

    sortRows(rows, 'price-desc')

    expect(rows.map((row) => row.id)).toEqual(original)
  })
})

describe('getVisibleRows', () => {
  it('возвращает строки плоской категории в исходном порядке', () => {
    const category: PriceCategory = {
      id: 'flat',
      title: 'Плоская',
      updatedAt: '2026-01-01',
      rows,
    }

    expect(getVisibleRows(category, { onlyInStock: false, sort: 'default' })).toBe(
      category.rows,
    )
  })

  it('разворачивает группы в исходном порядке', () => {
    expect(
      getVisibleRows(groupedCategory, { onlyInStock: false, sort: 'default' }).map(
        (row) => row.id,
      ),
    ).toEqual(['one', 'two', 'three'])
  })
})

describe('getVisibleGroups', () => {
  it('фильтрует строки и скрывает опустевшие группы', () => {
    const groups = getVisibleGroups(groupedCategory, {
      onlyInStock: true,
      sort: 'default',
    })

    expect(groups).toHaveLength(1)
    expect(groups[0].id).toBe('first')
    expect(groups[0].rows.map((row) => row.id)).toEqual(['one'])
  })

  it('сохраняет порядок групп и сортирует строки внутри', () => {
    const groups = getVisibleGroups(groupedCategory, {
      onlyInStock: false,
      sort: 'price-desc',
    })

    expect(groups.map((group) => group.id)).toEqual(['first', 'second'])
    expect(groups[0].rows.map((row) => row.id)).toEqual(['one', 'two'])
  })
})

describe('searchCategories', () => {
  const searchData: PriceCategory[] = [
    {
      id: 'berries',
      title: 'Ягоды',
      updatedAt: '2026-01-01',
      rows: [],
      groups: [
        {
          id: 'blackberries',
          title: 'Ежевика',
          rows: [
            { id: 'b1', name: 'Лох Тей', price: 300 },
            { id: 'b2', name: 'Торнфри', price: null },
          ],
        },
        {
          id: 'raspberries',
          title: 'Малина',
          rows: [{ id: 'r1', name: 'Гусар', price: 200 }],
        },
      ],
    },
    {
      id: 'apples',
      title: 'Яблони',
      updatedAt: '2026-01-01',
      rows: [
        { id: 'a1', name: 'Антоновка', price: 400 },
        { id: 'a2', name: 'Чёрный принц', price: null },
      ],
    },
  ]

  it('находит категорию и возвращает все её строки', () => {
    const result = searchCategories(searchData, 'Ягоды')

    expect(result).toHaveLength(1)
    expect(result[0].groups?.map((group) => group.id)).toEqual([
      'blackberries',
      'raspberries',
    ])
    expect(result[0].groups?.flatMap((group) => group.rows).length).toBe(3)
  })

  it('находит группу и возвращает все её строки', () => {
    const result = searchCategories(searchData, 'ежевика')

    expect(result).toHaveLength(1)
    expect(result[0].groups).toHaveLength(1)
    expect(result[0].groups?.[0].rows.map((row) => row.name)).toEqual([
      'Лох Тей',
      'Торнфри',
    ])
  })

  it('находит сорт внутри группы', () => {
    const result = searchCategories(searchData, 'Лох Тей')

    expect(result).toHaveLength(1)
    expect(result[0].groups).toHaveLength(1)
    expect(result[0].groups?.[0].rows.map((row) => row.name)).toEqual(['Лох Тей'])
  })

  it('находит сорт в плоской категории и игнорирует ё и регистр', () => {
    const result = searchCategories(searchData, 'черный ПРИНЦ')

    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('apples')
    expect(result[0].rows.map((row) => row.name)).toEqual(['Чёрный принц'])
  })

  it('сопоставляет несколько слов из разных уровней', () => {
    const result = searchCategories(searchData, 'ягоды малина')

    expect(result).toHaveLength(1)
    expect(result[0].groups).toHaveLength(1)
    expect(result[0].groups?.[0].id).toBe('raspberries')
  })

  it('возвращает пустой результат, если ничего не нашлось', () => {
    expect(searchCategories(searchData, 'груша')).toEqual([])
  })

  it('возвращает исходный список для пустого запроса', () => {
    expect(searchCategories(searchData, '   ')).toBe(searchData)
  })
})
