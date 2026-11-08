import { useEffect, useRef, useState } from 'react'
import { ChevronDown, Download, Printer } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { priceCategories } from '@/entities/price-list/model/data'
import type { PriceCategory, PriceRow, PriceSort } from '@/entities/price-list/model/types'
import { getCategorySummary } from '@/entities/price-list/lib/selectors'
import { downloadCsv } from '@/shared/lib/downloadCsv'
import { formatPrice } from '@/shared/lib/formatPrice'
import { pluralRu } from '@/shared/lib/plural'
import { useMediaQuery } from '@/shared/lib/useMediaQuery'
import { PriceCategoryNav } from '@/widgets/price-category-nav/PriceCategoryNav'
import { PriceTable } from '@/widgets/price-table/PriceTable'
import styles from './PriceList.module.scss'

const DESKTOP_QUERY = '(min-width: 56rem)'

function parseSort(value: string | null): PriceSort {
  if (value === 'name' || value === 'price-asc' || value === 'price-desc') {
    return value
  }

  return 'default'
}

function getAccordionSummary(category: PriceCategory, onlyInStock: boolean): string {
  const summary = getCategorySummary(category)
  const count = onlyInStock ? summary.inStock : summary.total
  const priceLabel =
    summary.minPrice !== null
      ? `от ${formatPrice(summary.minPrice)} руб.`
      : 'нет в наличии'

  return `${count} ${pluralRu(count, 'сорт', 'сорта', 'сортов')} · ${priceLabel}`
}

function toCsvRow(category: PriceCategory, row: PriceRow, section: string): string[] {
  const note = [row.description, row.note].filter(Boolean).join(' · ')

  return [
    category.title,
    section,
    row.name,
    row.ripening ?? '',
    note,
    row.isNew ? 'да' : '',
    row.price !== null ? String(row.price) : '',
    row.price !== null ? 'в наличии' : 'нет в наличии',
  ]
}

export function PriceList() {
  const [searchParams, setSearchParams] = useSearchParams()
  const isDesktop = useMediaQuery(DESKTOP_QUERY)
  const contentRef = useRef<HTMLDivElement>(null)
  const previousCategoryId = useRef<string | null>(null)

  const requestedCategoryId = searchParams.get('category')
  const activeCategory =
    priceCategories.find((category) => category.id === requestedCategoryId) ??
    priceCategories[0]
  const [openCategoryId, setOpenCategoryId] = useState<string | null>(
    activeCategory.id,
  )
  const onlyInStock = searchParams.get('stock') === '1'
  const sort = parseSort(searchParams.get('sort'))
  const activeSummary = getCategorySummary(activeCategory)
  const liveCount = onlyInStock ? activeSummary.inStock : activeSummary.total
  const liveMessage = `Категория: ${activeCategory.title}. ${liveCount} ${pluralRu(
    liveCount,
    'сорт',
    'сорта',
    'сортов',
  )}${onlyInStock ? ' в наличии' : ''}.`

  useEffect(() => {
    const categoryParam = searchParams.get('category')
    const sortParam = searchParams.get('sort')
    const invalidCategory =
      categoryParam !== null &&
      !priceCategories.some((category) => category.id === categoryParam)
    const invalidSort = sortParam !== null && parseSort(sortParam) === 'default'

    if (!invalidCategory && !invalidSort) {
      return
    }

    const next = new URLSearchParams(searchParams)

    if (invalidCategory) {
      next.delete('category')
    }

    if (invalidSort) {
      next.delete('sort')
    }

    setSearchParams(next, { replace: true })
  }, [searchParams, setSearchParams])

  useEffect(() => {
    setOpenCategoryId(activeCategory.id)
  }, [activeCategory.id, isDesktop])

  useEffect(() => {
    if (previousCategoryId.current === null) {
      previousCategoryId.current = activeCategory.id
      return
    }

    if (previousCategoryId.current === activeCategory.id) {
      return
    }

    previousCategoryId.current = activeCategory.id
    const node = contentRef.current

    if (!node || node.getBoundingClientRect().top >= 0) {
      return
    }

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    node.scrollIntoView({
      behavior: reduceMotion ? 'auto' : 'smooth',
      block: 'start',
    })
  }, [activeCategory.id])

  const updateParams = (updates: Record<string, string | null>, replace = false) => {
    const next = new URLSearchParams(searchParams)

    for (const [key, value] of Object.entries(updates)) {
      if (value === null) {
        next.delete(key)
      } else {
        next.set(key, value)
      }
    }

    setSearchParams(next, { replace })
  }

  const handleCategorySelect = (id: string) => {
    if (isDesktop) {
      if (id !== activeCategory.id) {
        updateParams({ category: id })
      }

      return
    }

    if (id === openCategoryId) {
      setOpenCategoryId(null)
      return
    }

    setOpenCategoryId(id)
    updateParams({ category: id })
  }

  const handleStockChange = (checked: boolean) => {
    updateParams({ stock: checked ? '1' : null }, true)
  }

  const handleSortChange = (nextSort: PriceSort) => {
    updateParams({ sort: nextSort === 'default' ? null : nextSort }, true)
  }

  const handleResetStock = () => {
    handleStockChange(false)
  }

  const handleDownloadCsv = () => {
    const header = [
      'Категория',
      'Раздел',
      'Сорт',
      'Срок созревания',
      'Примечание',
      'Новинка',
      'Цена, руб.',
      'Наличие',
    ]
    const rows = priceCategories.flatMap((category) => {
      if (category.groups?.length) {
        return category.groups.flatMap((group) =>
          group.rows.map((row) => toCsvRow(category, row, group.title)),
        )
      }

      return category.rows.map((row) => toCsvRow(category, row, ''))
    })
    const date = new Date().toISOString().slice(0, 10)

    downloadCsv(`prajs-list-${date}.csv`, [header, ...rows])
  }

  return (
    <>
      <div className={styles.screenOnly}>
        <header className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Прайс-лист</h1>
          <p className={styles.lead}>
            Прайс-лист осени 2026. Цены указаны за один саженец. Выберите категорию
            — увидите весь список сортов и цены.
          </p>
        </header>

        <p className={styles.srOnly} aria-live="polite">
          {liveMessage}
        </p>

        <div className={styles.toolbar}>
          <label className={styles.stockToggle}>
            <input
              type="checkbox"
              checked={onlyInStock}
              onChange={(event) => handleStockChange(event.target.checked)}
            />
            <span>Только в наличии</span>
          </label>
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.actionButton}
              onClick={() => window.print()}
            >
              <Printer aria-hidden strokeWidth={1.75} />
              Печать
            </button>
            <button
              type="button"
              className={styles.actionButton}
              onClick={handleDownloadCsv}
              aria-label="Скачать весь прайс в формате CSV"
            >
              <Download aria-hidden strokeWidth={1.75} />
              Скачать CSV
            </button>
          </div>
        </div>

        {isDesktop ? (
          <div className={styles.layout}>
            <PriceCategoryNav
              categories={priceCategories}
              activeId={activeCategory.id}
              onlyInStock={onlyInStock}
              onSelect={handleCategorySelect}
            />
            <div className={styles.content} ref={contentRef}>
              <PriceTable
                category={activeCategory}
                onlyInStock={onlyInStock}
                sort={sort}
                onSortChange={handleSortChange}
                onResetStock={handleResetStock}
              />
            </div>
          </div>
        ) : (
          <div className={styles.accordion}>
            {priceCategories.map((category) => {
              const isExpanded = openCategoryId === category.id

              return (
                <section key={category.id} className={styles.accordionItem}>
                  <h2 className={styles.accordionHeading}>
                    <button
                      type="button"
                      id={`category-button-${category.id}`}
                      className={
                        isExpanded
                          ? `${styles.accordionButton} ${styles.accordionButtonOpen}`
                          : styles.accordionButton
                      }
                      aria-expanded={isExpanded}
                      aria-controls={
                        isExpanded ? `category-panel-${category.id}` : undefined
                      }
                      onClick={() => handleCategorySelect(category.id)}
                    >
                      <span className={styles.accordionName}>{category.title}</span>
                      <span className={styles.accordionMeta}>
                        {getAccordionSummary(category, onlyInStock)}
                      </span>
                      <ChevronDown aria-hidden strokeWidth={2} />
                    </button>
                  </h2>
                  {isExpanded && (
                    <div
                      id={`category-panel-${category.id}`}
                      className={styles.accordionPanel}
                      role="region"
                      aria-labelledby={`category-button-${category.id}`}
                    >
                      <PriceTable
                        category={category}
                        onlyInStock={onlyInStock}
                        sort={sort}
                        onSortChange={handleSortChange}
                        onResetStock={handleResetStock}
                        hideTitle
                        embedded
                      />
                    </div>
                  )}
                </section>
              )
            })}
          </div>
        )}
      </div>

      <div className={styles.printOnly}>
        <h1 className={styles.printTitle}>Прайс-лист</h1>
        <p className={styles.printLead}>
          Прайс-лист осени 2026. Цены указаны за один саженец. Наличие уточняйте
          у продавца.
        </p>
        <div className={styles.printList}>
          {priceCategories.map((category) => (
            <PriceTable
              key={category.id}
              category={category}
              onlyInStock={false}
              sort="default"
              onSortChange={handleSortChange}
              printMode
              idPrefix={`print-${category.id}`}
            />
          ))}
        </div>
      </div>
    </>
  )
}
