import { Fragment } from 'react'
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'
import type { PriceCategory, PriceSort } from '@/entities/price-list/model/types'
import {
  getCategorySummary,
  getVisibleGroups,
  getVisibleRows,
} from '@/entities/price-list/lib/selectors'
import { formatDate } from '@/shared/lib/formatDate'
import { formatPrice } from '@/shared/lib/formatPrice'
import { pluralRu } from '@/shared/lib/plural'
import styles from './PriceTable.module.scss'

interface PriceTableProps {
  category: PriceCategory
  onlyInStock: boolean
  sort: PriceSort
  onSortChange: (sort: PriceSort) => void
  onResetStock?: () => void
  /** Убирает заголовок, когда таблица встроена в аккордеон */
  hideTitle?: boolean
  /** Убирает внешнюю рамку и отступы */
  embedded?: boolean
  /** Печатная версия без интерактивных контролов */
  printMode?: boolean
  /** Префикс для id заголовка, чтобы избежать дублей на странице */
  idPrefix?: string
}

const sortOptions: { value: PriceSort; label: string }[] = [
  { value: 'default', label: 'По сроку созревания' },
  { value: 'name', label: 'По названию' },
  { value: 'price-asc', label: 'Сначала дешевле' },
  { value: 'price-desc', label: 'Сначала дороже' },
]

export function PriceTable({
  category,
  onlyInStock,
  sort,
  onSortChange,
  onResetStock,
  hideTitle = false,
  embedded = false,
  printMode = false,
  idPrefix,
}: PriceTableProps) {
  const headingId = `${idPrefix ?? category.id}-heading`
  const summary = getCategorySummary(category)
  const grouped = Boolean(category.groups?.length)
  const visibleGroups = grouped
    ? getVisibleGroups(category, { onlyInStock, sort })
    : []
  const visibleRows = grouped
    ? visibleGroups.flatMap((group) => group.rows)
    : getVisibleRows(category, { onlyInStock, sort })
  const isEmpty = visibleRows.length === 0

  const metaParts = [
    `Обновлено ${formatDate(category.updatedAt)}`,
    `${summary.total} ${pluralRu(summary.total, 'сорт', 'сорта', 'сортов')}`,
    summary.minPrice !== null
      ? `от ${formatPrice(summary.minPrice)} руб.`
      : 'нет в наличии',
  ]

  if (summary.soldOut > 0 && summary.inStock > 0) {
    metaParts.push(`${summary.inStock} в наличии`)
  }

  const nameAriaSort = sort === 'name' ? 'ascending' : 'none'
  const priceAriaSort =
    sort === 'price-asc' ? 'ascending' : sort === 'price-desc' ? 'descending' : 'none'
  const nameSortIcon =
    sort === 'name' ? (
      <ArrowUp aria-hidden strokeWidth={2} />
    ) : (
      <ArrowUpDown aria-hidden strokeWidth={2} />
    )
  const priceSortIcon =
    sort === 'price-asc' ? (
      <ArrowUp aria-hidden strokeWidth={2} />
    ) : sort === 'price-desc' ? (
      <ArrowDown aria-hidden strokeWidth={2} />
    ) : (
      <ArrowUpDown aria-hidden strokeWidth={2} />
    )

  const handleNameSort = () => {
    onSortChange(sort === 'name' ? 'default' : 'name')
  }

  const handlePriceSort = () => {
    if (sort === 'price-asc') {
      onSortChange('price-desc')
      return
    }

    if (sort === 'price-desc') {
      onSortChange('default')
      return
    }

    onSortChange('price-asc')
  }

  const rootClassName = [styles.root, embedded ? styles.embedded : '']
    .filter(Boolean)
    .join(' ')

  return (
    <section className={rootClassName} aria-labelledby={hideTitle ? undefined : headingId}>
      <div className={styles.head}>
        {!hideTitle && (
          <h2 id={headingId} className={styles.title}>
            {category.title}
          </h2>
        )}
        <p className={styles.meta}>{metaParts.join(' · ')}</p>
      </div>

      {!printMode && (
        <label className={styles.sortControl}>
          <span>Сортировка</span>
          <select
            value={sort}
            onChange={(event) => onSortChange(event.target.value as PriceSort)}
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      )}

      {isEmpty ? (
        <div className={styles.empty}>
          <p>
            {onlyInStock
              ? 'В наличии нет сортов этой категории.'
              : 'В этой категории пока нет сортов.'}
          </p>
          {onlyInStock && summary.total > 0 && onResetStock && (
            <button
              type="button"
              className={styles.resetButton}
              onClick={onResetStock}
            >
              Показать все сорта
            </button>
          )}
        </div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <caption className={styles.caption}>
              {category.title}: сорта и цены
            </caption>
            <thead>
              <tr>
                <th scope="col" aria-sort={nameAriaSort}>
                  {printMode ? (
                    'Сорт'
                  ) : (
                    <button
                      type="button"
                      className={styles.sortButton}
                      onClick={handleNameSort}
                    >
                      Сорт
                      {nameSortIcon}
                    </button>
                  )}
                </th>
                <th scope="col">Срок созревания</th>
                <th scope="col">Примечание</th>
                <th scope="col" className={styles.priceHead} aria-sort={priceAriaSort}>
                  {printMode ? (
                    'Цена'
                  ) : (
                    <button
                      type="button"
                      className={styles.sortButton}
                      onClick={handlePriceSort}
                    >
                      Цена
                      {priceSortIcon}
                    </button>
                  )}
                </th>
              </tr>
            </thead>
            <tbody>
              {grouped
                ? visibleGroups.map((group) => (
                    <Fragment key={group.id}>
                      <tr className={styles.groupRow}>
                        <th scope="colgroup" colSpan={4}>
                          {group.title}
                        </th>
                      </tr>
                      {group.rows.map((row) => (
                        <PriceTableRow key={row.id} row={row} />
                      ))}
                    </Fragment>
                  ))
                : visibleRows.map((row) => <PriceTableRow key={row.id} row={row} />)}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

function PriceTableRow({
  row,
}: {
  row: PriceCategory['rows'][number]
}) {
  return (
    <tr className={row.price === null ? styles.soldOut : undefined}>
      <td data-label="Сорт">
        <span className={styles.name}>{row.name}</span>
        {row.isNew && <span className={styles.badge}>Новинка</span>}
      </td>
      <td data-label="Срок созревания">{row.ripening ?? '—'}</td>
      <td data-label="Примечание">{row.description ?? '—'}</td>
      <td data-label="Цена" className={styles.priceCell}>
        {row.price !== null ? (
          `${formatPrice(row.price)} руб.`
        ) : (
          <span className={styles.soldOutLabel}>Продан</span>
        )}
      </td>
    </tr>
  )
}
