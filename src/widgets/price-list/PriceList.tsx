import { useEffect, useRef, useState } from 'react'
import { ChevronDown, Download, Printer, Search, X } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { priceCategories } from '@/entities/price-list/model/data'
import type { PriceCategory, PriceSort } from '@/entities/price-list/model/types'
import { buildCsvRows } from '@/entities/price-list/lib/exportRows'
import { downloadPriceListExcel } from '@/entities/price-list/lib/exportExcel'
import {
  getCategorySummary,
  searchCategories,
} from '@/entities/price-list/lib/selectors'
import { downloadCsv } from '@/shared/lib/downloadCsv'
import { formatPrice } from '@/shared/lib/formatPrice'
import { pluralRu } from '@/shared/lib/plural'
import { useMediaQuery } from '@/shared/lib/useMediaQuery'
import { PriceCategoryNav } from '@/widgets/price-category-nav/PriceCategoryNav'
import { PriceTable } from '@/widgets/price-table/PriceTable'
import styles from './PriceList.module.scss'

const DESKTOP_QUERY = '(min-width: 56rem)'

function parseSort(value: string | null): PriceSort {
  if (value === 'price-asc' || value === 'price-desc') {
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

export function PriceList() {
  const [searchParams, setSearchParams] = useSearchParams()
  const isDesktop = useMediaQuery(DESKTOP_QUERY)
  const contentRef = useRef<HTMLDivElement>(null)
  const previousCategoryId = useRef<string | null>(null)
  const downloadMenuRef = useRef<HTMLDivElement>(null)
  const downloadButtonRef = useRef<HTMLButtonElement>(null)
  const [isDownloadOpen, setIsDownloadOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [exportError, setExportError] = useState<string | null>(null)

  const requestedCategoryId = searchParams.get('category')
  const activeCategory =
    priceCategories.find((category) => category.id === requestedCategoryId) ??
    priceCategories[0]
  const [openCategoryId, setOpenCategoryId] = useState<string | null>(
    activeCategory.id,
  )
  const onlyInStock = searchParams.get('stock') === '1'
  const sort = parseSort(searchParams.get('sort'))
  const searchQuery = searchParams.get('q') ?? ''
  const searchTerm = searchQuery.trim()
  const isSearching = searchTerm.length > 0
  const matchedSearchResults = isSearching
    ? searchCategories(priceCategories, searchTerm)
    : []
  const searchResults = onlyInStock
    ? matchedSearchResults.filter(
        (category) => getCategorySummary(category).inStock > 0,
      )
    : matchedSearchResults
  const searchCount = searchResults.reduce((total, category) => {
    const summary = getCategorySummary(category)

    return total + (onlyInStock ? summary.inStock : summary.total)
  }, 0)
  const activeSummary = getCategorySummary(activeCategory)
  const liveCount = onlyInStock ? activeSummary.inStock : activeSummary.total
  const liveMessage = isSearching
    ? searchCount > 0
      ? `Поиск: ${searchTerm}. Найдено ${searchCount} ${pluralRu(
          searchCount,
          'сорт',
          'сорта',
          'сортов',
        )}.`
      : `Поиск: ${searchTerm}. Ничего не найдено.`
    : `Категория: ${activeCategory.title}. ${liveCount} ${pluralRu(
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

  useEffect(() => {
    if (!isDownloadOpen) {
      return
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (!downloadMenuRef.current?.contains(event.target as Node)) {
        setIsDownloadOpen(false)
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') {
        return
      }

      setIsDownloadOpen(false)
      downloadButtonRef.current?.focus()
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isDownloadOpen])

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

  const handleSearchChange = (value: string) => {
    updateParams({ q: value ? value : null }, true)
  }

  const getDownloadFilename = (extension: string) =>
    `prajs-list-${new Date().toISOString().slice(0, 10)}.${extension}`

  const handleDownloadCsv = () => {
    setIsDownloadOpen(false)
    setExportError(null)
    downloadCsv(getDownloadFilename('csv'), buildCsvRows(priceCategories))
  }

  const handleDownloadExcel = async () => {
    if (isExporting) {
      return
    }

    setIsDownloadOpen(false)
    setExportError(null)
    setIsExporting(true)

    try {
      await downloadPriceListExcel(
        priceCategories,
        getDownloadFilename('xlsx'),
      )
    } catch (error) {
      console.error('Не удалось сформировать Excel-файл', error)
      setExportError('Не удалось сформировать Excel-файл. Попробуйте ещё раз.')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <>
      <div className={styles.screenOnly}>
        <header className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Прайс-лист</h1>
          <p className={styles.lead}>
            Прайс-лист осени 2026. Цены указаны за один саженец. Ищите по сорту,
            группе или категории — или выберите категорию в списке.
          </p>
        </header>

        <p className={styles.srOnly} aria-live="polite">
          {liveMessage}
        </p>

        <div className={styles.toolbar}>
          <label className={styles.searchField}>
            <Search aria-hidden strokeWidth={1.75} />
            <span className={styles.srOnly}>
              Поиск по сорту, группе или категории
            </span>
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => handleSearchChange(event.target.value)}
              placeholder="Сорт, группа или категория"
              autoComplete="off"
            />
            {searchQuery && (
              <button
                type="button"
                className={styles.searchClear}
                onClick={() => handleSearchChange('')}
                aria-label="Очистить поиск"
              >
                <X aria-hidden strokeWidth={2} />
              </button>
            )}
          </label>

          <div className={styles.toolbarRow}>
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

              <div className={styles.download} ref={downloadMenuRef}>
                <button
                  ref={downloadButtonRef}
                  type="button"
                  className={styles.actionButton}
                  onClick={() => setIsDownloadOpen((open) => !open)}
                  aria-haspopup="menu"
                  aria-expanded={isDownloadOpen}
                  aria-controls={
                    isDownloadOpen ? 'price-download-menu' : undefined
                  }
                  disabled={isExporting}
                >
                  <Download aria-hidden strokeWidth={1.75} />
                  {isExporting ? 'Готовим файл…' : 'Скачать'}
                  <ChevronDown
                    className={styles.downloadChevron}
                    aria-hidden
                    strokeWidth={1.75}
                  />
                </button>

                {isDownloadOpen && (
                  <div
                    id="price-download-menu"
                    className={styles.downloadMenu}
                    role="menu"
                    aria-label="Формат файла"
                  >
                    <button
                      type="button"
                      role="menuitem"
                      className={styles.downloadItem}
                      onClick={handleDownloadCsv}
                    >
                      <span className={styles.downloadItemLabel}>CSV</span>
                      <span className={styles.downloadHint}>
                        Для Excel и таблиц
                      </span>
                    </button>
                    <button
                      type="button"
                      role="menuitem"
                      className={styles.downloadItem}
                      onClick={handleDownloadExcel}
                    >
                      <span className={styles.downloadItemLabel}>
                        Excel (.xlsx)
                      </span>
                      <span className={styles.downloadHint}>
                        Один лист со всеми сортами
                      </span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {exportError && (
          <p className={styles.exportError} role="alert">
            {exportError}
          </p>
        )}

        {isSearching ? (
          <div className={styles.searchResults}>
            {searchResults.length > 0 ? (
              <div className={styles.searchList}>
                {searchResults.map((category) => (
                  <PriceTable
                    key={category.id}
                    category={category}
                    onlyInStock={onlyInStock}
                    sort={sort}
                    onSortChange={handleSortChange}
                    onResetStock={handleResetStock}
                    idPrefix={`search-${category.id}`}
                  />
                ))}
              </div>
            ) : (
              <div className={styles.searchEmpty}>
                {onlyInStock && matchedSearchResults.length > 0 ? (
                  <>
                    <p>В найденных категориях нет сортов в наличии.</p>
                    <button
                      type="button"
                      className={styles.resetSearchButton}
                      onClick={handleResetStock}
                    >
                      Показать все сорта
                    </button>
                  </>
                ) : (
                  <>
                    <p>По запросу «{searchTerm}» ничего не найдено.</p>
                    <p>
                      Попробуйте изменить запрос — ищем по сорту, группе и
                      категории.
                    </p>
                    <button
                      type="button"
                      className={styles.resetSearchButton}
                      onClick={() => handleSearchChange('')}
                    >
                      Сбросить поиск
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        ) : isDesktop ? (
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
