import { describe, expect, it } from 'vitest'
import { priceCategories } from '../model/data'
import {
  EXPORT_COLUMNS,
  buildCsvRows,
  buildExportRows,
} from './exportRows'

describe('buildExportRows', () => {
  it('разворачивает весь прайс в 322 строки', () => {
    const rows = buildExportRows(priceCategories)

    expect(rows).toHaveLength(322)
    expect(new Set(rows.map((row) => row.category)).size).toBe(13)
  })

  it('объединяет описание и дополнительную отметку', () => {
    const row = buildExportRows(priceCategories).find(
      (item) => item.name === 'Велспур',
    )

    expect(row).toMatchObject({
      category: 'Яблони',
      section: '',
      name: 'Велспур',
      ripening: 'зимнее',
      note: 'красное · низкорослое',
      isNew: '',
      price: 400,
      availability: 'в наличии',
    })
  })

  it('помечает проданный сорт и оставляет цену пустой', () => {
    const row = buildExportRows(priceCategories).find(
      (item) => item.category === 'Черешни и вишни' && item.name === 'Гирлянда',
    )

    expect(row).toMatchObject({
      section: 'Вишни',
      price: null,
      availability: 'нет в наличии',
    })
  })
})

describe('buildCsvRows', () => {
  it('добавляет шапку и сохраняет порядок колонок', () => {
    const rows = buildCsvRows(priceCategories)

    expect(rows).toHaveLength(323)
    expect(rows[0]).toEqual(EXPORT_COLUMNS.map((column) => column.title))
  })

  it('оставляет пустую цену у проданного сорта', () => {
    const exportRows = buildExportRows(priceCategories)
    const index = exportRows.findIndex(
      (item) => item.category === 'Черешни и вишни' && item.name === 'Гирлянда',
    )
    const csvRow = buildCsvRows(priceCategories)[index + 1]

    expect(csvRow[2]).toBe('Гирлянда')
    expect(csvRow[6]).toBe('')
    expect(csvRow[7]).toBe('нет в наличии')
  })
})
