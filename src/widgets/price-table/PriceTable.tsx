import type { PriceTable as PriceTableModel } from '@/entities/price-list/model/types'
import { formatPrice } from '@/shared/lib/formatPrice'
import styles from './PriceTable.module.scss'

export function PriceTable({ table }: { table: PriceTableModel }) {
  // TODO: DataTable, поиск, фильтр по цене, скачать CSV, печать
  return (
    <section className={styles.root} aria-labelledby={`${table.id}-heading`}>
      <h2 id={`${table.id}-heading`}>{table.title}</h2>
      <ul className={styles.rows}>
        {table.rows.map((row) => (
          <li key={row.id}>
            {row.name} — {formatPrice(row.price)} ₽ / {row.unit}
          </li>
        ))}
      </ul>
    </section>
  )
}
