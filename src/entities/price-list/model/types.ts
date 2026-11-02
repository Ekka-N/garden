export interface PriceRow {
  id: string
  name: string
  age: string
  height: string
  price: number
  unit: 'шт' | 'саженец'
}

export interface PriceTable {
  id: string
  title: string
  updatedAt: string
  rows: PriceRow[]
}
