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
    case 'name':
      sorted.sort((a, b) => collator.compare(a.name, b.name))
      break
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
