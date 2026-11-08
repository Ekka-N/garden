export type PriceSort = 'default' | 'price-asc' | 'price-desc'

export interface PriceRow {
  id: string
  name: string
  ripening?: string
  /** Порядковый номер срока созревания для сортировки, если нужен ручной порядок */
  ripeningOrder?: number
  /** Характеристика плода: цвет, форма, размер */
  description?: string
  /** Дополнительная отметка: подвой, самоплодность, контейнер */
  note?: string
  isNew?: boolean
  price: number | null
}

export interface PriceGroup {
  id: string
  title: string
  rows: PriceRow[]
}

export interface PriceCategory {
  id: string
  title: string
  /** Короткое название для рельса категорий */
  shortTitle?: string
  updatedAt: string
  /** Строки категории, если она не разбита на группы */
  rows: PriceRow[]
  /** Группы внутри таблицы (например, «Абрикосы» и «Персики») */
  groups?: PriceGroup[]
}
