import { ArrowRight, MessageCircle, Phone, Sprout } from 'lucide-react'
import { Link } from 'react-router-dom'
import { NURSERY } from '@/data/nursery'
import styles from './ProductInfo.module.scss'

export function ProductInfo() {
  return (
    <section className={styles.hero} aria-labelledby="hero-heading">
      <div className={styles.heading}>
        <p className={styles.eyebrow}>
          <Sprout aria-hidden strokeWidth={1.75} />
          Питомник «{NURSERY.name}»
        </p>
        <h1 id="hero-heading" className={styles.title}>
          {NURSERY.season}
        </h1>
        <p className={styles.lead}>
          Собственные сорта, ручная прививка и маркировка каждого саженца — из
          хутора Поповка.
        </p>
      </div>

      <div className={styles.text}>
        {NURSERY.intro.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>

      <div className={styles.order}>
        <h2 className={styles.orderTitle}>Предварительный заказ</h2>
        <a className={styles.phone} href={NURSERY.phoneHref}>
          <Phone aria-hidden strokeWidth={1.75} />
          {NURSERY.phone}
        </a>
        <p className={styles.orderText}>
          <MessageCircle aria-hidden strokeWidth={1.75} />
          {NURSERY.preorderNote}
        </p>
        <p className={styles.orderNote}>{NURSERY.contactNote}</p>
      </div>

      <div className={styles.actions}>
        <Link className={styles.primaryButton} to="/price-list">
          Смотреть прайс-лист
          <ArrowRight aria-hidden strokeWidth={2} />
        </Link>
      </div>
    </section>
  )
}
