import type { PriceCategory } from '@/entities/price-list/model/types'
import { getCategorySummary } from '@/entities/price-list/lib/selectors'
import { formatPrice } from '@/shared/lib/formatPrice'
import { pluralRu } from '@/shared/lib/plural'
import styles from './PriceCategoryNav.module.scss'

interface PriceCategoryNavProps {
  categories: PriceCategory[]
  activeId: string
  onlyInStock: boolean
  onSelect: (id: string) => void
}

export function PriceCategoryNav({
  categories,
  activeId,
  onlyInStock,
  onSelect,
}: PriceCategoryNavProps) {
  return (
    <nav className={styles.root} aria-label="Категории прайс-листа">
      <h2 className={styles.title}>Категории</h2>
      <ul className={styles.list}>
        {categories.map((category) => {
          const summary = getCategorySummary(category)
          const isActive = category.id === activeId
          const count = onlyInStock ? summary.inStock : summary.total
          const countLabel = `${count} ${pluralRu(
            count,
            'сорт',
            'сорта',
            'сортов',
          )}`
          const priceLabel =
            summary.minPrice !== null
              ? `от ${formatPrice(summary.minPrice)} руб.`
              : 'нет в наличии'

          return (
            <li key={category.id}>
              <button
                type="button"
                className={isActive ? styles.activeItem : styles.item}
                aria-current={isActive ? 'true' : undefined}
                onClick={() => onSelect(category.id)}
              >
                <span className={styles.name}>
                  {category.shortTitle ?? category.title}
                </span>
                <span className={styles.meta}>
                  {countLabel} · {priceLabel}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
