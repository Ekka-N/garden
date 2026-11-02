import { priceTables } from '@/entities/price-list/model/data'
import { PriceTable } from '@/widgets/price-table/PriceTable'

export function PriceListPage() {
  return (
    <>
      <h1>Прайс-лист</h1>
      {priceTables.map((table) => (
        <PriceTable key={table.id} table={table} />
      ))}
    </>
  )
}
