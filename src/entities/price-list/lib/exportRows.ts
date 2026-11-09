import type { PriceCategory } from '../model/types'

export interface PriceExportRow {
  category: string
  section: string
  name: string
  ripening: string
  note: string
  isNew: string
  price: number | null
  availability: 'в наличии' | 'нет в наличии'
}

export interface ExportColumn {
  key: keyof PriceExportRow
  title: string
  width: number
}

export const EXPORT_COLUMNS: ExportColumn[] = [
  { key: 'section', title: 'Раздел', width: 30 },
  { key: 'name', title: 'Сорт', width: 40 },
  { key: 'ripening', title: 'Срок созревания', width: 20 },
  { key: 'note', title: 'Примечание', width: 60 },
  { key: 'isNew', title: 'Новинка', width: 10 },
  { key: 'price', title: 'Цена, руб.', width: 12 },
  { key: 'availability', title: 'Наличие', width: 18 },
]

/** Разворачивает категории и группы в единый список строк для экспорта. */
export function buildExportRows(categories: PriceCategory[]): PriceExportRow[] {
  return categories.flatMap((category) => {
    if (category.groups?.length) {
      return category.groups.flatMap((group) =>
        group.rows.map((row) => toExportRow(category, row, group.title)),
      )
    }

    return category.rows.map((row) => toExportRow(category, row, ''))
  })
}

/** Готовит матрицу для CSV: шапка + строки в порядке колонок. */
export function buildCsvRows(categories: PriceCategory[]): string[][] {
  const headers = EXPORT_COLUMNS.map((column) => column.title)
  const rows = buildExportRows(categories).map((row) => [
    row.section,
    row.name,
    row.ripening,
    row.note,
    row.isNew,
    row.price !== null ? String(row.price) : '',
    row.availability,
  ])

  return [headers, ...rows]
}

function toExportRow(
  category: PriceCategory,
  row: PriceCategory['rows'][number],
  section: string,
): PriceExportRow {
  const note = [row.description, row.note].filter(Boolean).join(' · ')

  return {
    category: category.title,
    section,
    name: row.name,
    ripening: row.ripening ?? '',
    note,
    isNew: row.isNew ? 'да' : '',
    price: row.price,
    availability: row.price !== null ? 'в наличии' : 'нет в наличии',
  }
}
