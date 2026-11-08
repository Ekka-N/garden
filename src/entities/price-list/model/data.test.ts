import { describe, expect, it } from 'vitest'
import { priceCategories } from './data'
import type { PriceCategory, PriceRow } from './types'

function getRows(category: PriceCategory): PriceRow[] {
  if (category.groups?.length) {
    return category.groups.flatMap((group) => group.rows)
  }

  return category.rows
}

describe('данные прайс-листа', () => {
  it('содержит 13 категорий с уникальными id', () => {
    expect(priceCategories).toHaveLength(13)

    const ids = priceCategories.map((category) => category.id)

    expect(new Set(ids).size).toBe(ids.length)
  })

  it('хранит одну таблицу в одном JSON-файле', () => {
    const files = Object.keys(import.meta.glob('./data/*.json'))
      .map((path) => path.replace('./data/', ''))
      .sort()
    const expected = priceCategories
      .map((category) => `${category.id}.json`)
      .sort()

    expect(files).toEqual(expected)
  })

  it('заполняет название и дату обновления у каждой категории', () => {
    for (const category of priceCategories) {
      expect(category.title.trim()).not.toBe('')
      expect(category.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    }
  })

  it('даёт каждой строке уникальный id и непустое название', () => {
    const ids = priceCategories.flatMap((category) =>
      getRows(category).map((row) => row.id),
    )

    expect(new Set(ids).size).toBe(ids.length)

    for (const category of priceCategories) {
      for (const row of getRows(category)) {
        expect(row.name.trim()).not.toBe('')
      }
    }
  })

  it('использует только корректные цены или null для отсутствующих', () => {
    for (const category of priceCategories) {
      for (const row of getRows(category)) {
        if (row.price === null) {
          continue
        }

        expect(Number.isFinite(row.price)).toBe(true)
        expect(row.price).toBeGreaterThan(0)
      }
    }
  })

  it('не дублирует id групп', () => {
    const groupIds = priceCategories.flatMap((category) =>
      (category.groups ?? []).map((group) => group.id),
    )

    expect(new Set(groupIds).size).toBe(groupIds.length)
  })
})
