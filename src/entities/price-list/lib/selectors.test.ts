import { describe, expect, it } from 'vitest'
import type { PriceCategory, PriceRow } from '../model/types'
import {
  filterRows,
  getCategorySummary,
  getVisibleGroups,
  getVisibleRows,
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
  it('сортирует по названию с русской коллацией', () => {
    expect(sortRows(rows, 'name').map((row) => row.name)).toEqual([
      'Абрикос',
      'Груша',
      'Яблоко',
    ])
  })

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

    sortRows(rows, 'name')

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
