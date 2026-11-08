export interface PriceRow {
  id: string
  name: string
  ripening?: string
  description?: string
  isNew?: boolean
  price: number | null
}

export interface PriceGroup {
  id: string
  title: string
  rows: PriceRow[]
}

export interface PriceTable {
  id: string
  title: string
  updatedAt: string
  rows: PriceRow[]
  groups?: PriceGroup[]
}
