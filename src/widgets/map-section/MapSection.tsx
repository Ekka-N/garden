// src/widgets/map-section/MapSection.tsx
import { ExternalLink, MapPin } from 'lucide-react'
import { VENUE, getYandexMapsPointUrl, getYandexMapWidgetSrc } from '@/data/venue'
import styles from './MapSection.module.scss'

export function MapSection() {
  const mapSrc = getYandexMapWidgetSrc()
  const openMapsUrl = getYandexMapsPointUrl()

  return (
    <section className={styles.card} aria-labelledby="map-heading">
      <h2 id="map-heading" className={styles.cardTitle}>
        Как доехать
      </h2>
      <div className={styles.stack}>
        <div>
          <h3 className={styles.addressTitle}>
            <MapPin className={styles.addressIcon} aria-hidden strokeWidth={1.75} />
            Адрес пункта выдачи
          </h3>
          <p className={styles.address}>{VENUE.address}</p>
          {VENUE.directions.map((paragraph, index) => (
            <p key={index} className={styles.hint}>
              {paragraph}
            </p>
          ))}
        </div>

        <div className={styles.mapFrame}>
          <iframe
            title="Карта: как добраться до пункта выдачи"
            src={mapSrc}
            className={styles.iframe}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>

        <p className={styles.footerNote}>
          <a className="textLink" href={openMapsUrl} target="_blank" rel="noopener noreferrer">
            Открыть в Яндекс.Картах
            <ExternalLink className={styles.inlineIcon} aria-hidden strokeWidth={2} />
          </a>
          {' — '}
          можно построить маршрут на машине или общественным транспортом.
        </p>
      </div>
    </section>
  )
}
