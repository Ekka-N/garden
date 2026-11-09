import type { PriceCategory, PriceGroup, PriceRow, PriceSort } from '../model/types'

const collator = new Intl.Collator('ru', { sensitivity: 'base', numeric: true })

export interface CategorySummary {
  total: number
  inStock: number
  soldOut: number
  isNew: number
  minPrice: number | null
  maxPrice: number | null
}

export interface VisibleRowsOptions {
  onlyInStock: boolean
  sort: PriceSort
}

export function getAllRows(category: PriceCategory): PriceRow[] {
  return category.groups?.length
    ? category.groups.flatMap((group) => group.rows)
    : category.rows
}

export function getCategorySummary(category: PriceCategory): CategorySummary {
  const rows = getAllRows(category)
  let inStock = 0
  let minPrice: number | null = null
  let maxPrice: number | null = null

  for (const row of rows) {
    if (row.price === null) {
      continue
    }

    inStock += 1
    minPrice = minPrice === null ? row.price : Math.min(minPrice, row.price)
    maxPrice = maxPrice === null ? row.price : Math.max(maxPrice, row.price)
  }

  return {
    total: rows.length,
    inStock,
    soldOut: rows.length - inStock,
    isNew: rows.filter((row) => row.isNew).length,
    minPrice,
    maxPrice,
  }
}

export function filterRows(rows: PriceRow[], onlyInStock: boolean): PriceRow[] {
  return onlyInStock ? rows.filter((row) => row.price !== null) : rows
}

export function sortRows(rows: PriceRow[], sort: PriceSort): PriceRow[] {
  if (sort === 'default') {
    return rows
  }

  const sorted = [...rows]

  switch (sort) {
    case 'price-asc':
      sorted.sort((a, b) => compareByPrice(a, b, 1))
      break
    case 'price-desc':
      sorted.sort((a, b) => compareByPrice(a, b, -1))
      break
  }

  return sorted
}

export function getVisibleGroups(
  category: PriceCategory,
  options: VisibleRowsOptions,
): PriceGroup[] {
  if (!category.groups?.length) {
    return []
  }

  return category.groups
    .map((group) => ({
      ...group,
      rows: sortRows(filterRows(group.rows, options.onlyInStock), options.sort),
    }))
    .filter((group) => group.rows.length > 0)
}

export function getVisibleRows(
  category: PriceCategory,
  options: VisibleRowsOptions,
): PriceRow[] {
  if (category.groups?.length) {
    return getVisibleGroups(category, options).flatMap((group) => group.rows)
  }

  return sortRows(filterRows(category.rows, options.onlyInStock), options.sort)
}

/**
 * Оставляет только категории, у которых есть видимые строки,
 * и применяет к ним текущий фильтр и сортировку.
 */
export function getVisibleCategories(
  categories: PriceCategory[],
  options: VisibleRowsOptions,
): PriceCategory[] {
  return categories.flatMap((category) => {
    if (category.groups?.length) {
      const groups = getVisibleGroups(category, options)

      return groups.length > 0 ? [{ ...category, rows: [], groups }] : []
    }

    const rows = getVisibleRows(category, options)

    return rows.length > 0 ? [{ ...category, rows }] : []
  })
}

function compareByPrice(a: PriceRow, b: PriceRow, direction: 1 | -1): number {
  if (a.price === null && b.price === null) {
    return collator.compare(a.name, b.name)
  }

  if (a.price === null) {
    return 1
  }

  if (b.price === null) {
    return -1
  }

  const priceDiff = (a.price - b.price) * direction
  return priceDiff !== 0 ? priceDiff : collator.compare(a.name, b.name)
}

function normalize(value: string): string {
  return value.toLowerCase().replace(/ё/g, 'е').replace(/\s+/g, ' ').trim()
}

function matchesTokens(haystack: string, tokens: string[]): boolean {
  return tokens.every((token) => haystack.includes(token))
}

/**
 * Ищет по названию сорта, группы и категории.
 * Если совпала категория или группа, в результат попадают все её строки.
 */
export function searchCategories(
  categories: PriceCategory[],
  query: string,
): PriceCategory[] {
  const tokens = normalize(query).split(' ').filter(Boolean)

  if (tokens.length === 0) {
    return categories
  }

  const result: PriceCategory[] = []

  for (const category of categories) {
    const categoryHaystack = normalize(
      [category.title, category.shortTitle ?? ''].join(' '),
    )
    const categoryMatch = matchesTokens(categoryHaystack, tokens)

    if (category.groups?.length) {
      const groups = category.groups.flatMap((group) => {
        const groupHaystack = `${categoryHaystack} ${normalize(group.title)}`
        const groupMatch = categoryMatch || matchesTokens(groupHaystack, tokens)
        const rows = groupMatch
          ? group.rows
          : group.rows.filter((row) =>
              matchesTokens(`${groupHaystack} ${normalize(row.name)}`, tokens),
            )

        return rows.length > 0 ? [{ ...group, rows }] : []
      })

      if (groups.length > 0) {
        result.push({ ...category, rows: [], groups })
      }

      continue
    }

    const rows = categoryMatch
      ? category.rows
      : category.rows.filter((row) =>
          matchesTokens(`${categoryHaystack} ${normalize(row.name)}`, tokens),
        )

    if (rows.length > 0) {
      result.push({ ...category, rows })
    }
  }

  return result
}
