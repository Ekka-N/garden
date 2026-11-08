import type { PriceTable as PriceTableModel } from '@/entities/price-list/model/types'
import { formatPrice } from '@/shared/lib/formatPrice'
import styles from './PriceTable.module.scss'

export function PriceTable({ table }: { table: PriceTableModel }) {
  // TODO: DataTable, поиск, фильтр по цене, скачать CSV, печать, группы
  return (
    <section className={styles.root} aria-labelledby={`${table.id}-heading`}>
      <h2 id={`${table.id}-heading`}>{table.title}</h2>
      <ul className={styles.rows}>
        {table.rows.map((row) => (
          <li key={row.id}>
            <strong>{row.name}</strong>
            {row.ripening && <> · {row.ripening}</>}
            {row.description && <> · {row.description}</>}
            {row.isNew && <span className={styles.badge}>Новинка</span>}
            {' — '}
            {row.price !== null ? `${formatPrice(row.price)} руб.` : 'ПРОДАН'}
          </li>
        ))}
      </ul>
    </section>
  )
}
