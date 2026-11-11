import { useEffect, useState } from 'react'
import { CalendarClock, Clock } from 'lucide-react'
import { NURSERY } from '@/data/nursery'
import { getScheduleStatus, getStatusLabel } from './lib'
import styles from './Schedule.module.scss'

function useNow(): Date {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60_000)

    return () => window.clearInterval(timer)
  }, [])

  return now
}

export function Schedule() {
  const now = useNow()
  const today = now.getDay()
  const todayHours = NURSERY.hours.find((day) => day.weekday === today)
  const status = getScheduleStatus(todayHours, now, NURSERY.scheduleEnabled)
  const statusLabel = getStatusLabel(status)
  const notice = NURSERY.scheduleEnabled
    ? NURSERY.saleUntil
    : NURSERY.closedNotice

  return (
    <section className={styles.card} aria-labelledby="schedule-heading">
      <div className={styles.header}>
        <h2 id="schedule-heading" className={styles.title}>
          <Clock className={styles.titleIcon} aria-hidden strokeWidth={1.75} />
          График работы
        </h2>
        <p
          className={
            status.state === 'open'
              ? `${styles.status} ${styles.open}`
              : `${styles.status} ${styles.closed}`
          }
        >
          {statusLabel}
        </p>
      </div>

      {notice && (
        <p className={styles.notice}>
          <CalendarClock
            className={styles.noticeIcon}
            aria-hidden
            strokeWidth={1.75}
          />
          {notice}
        </p>
      )}

      {NURSERY.scheduleEnabled && (
        <ul className={styles.list}>
          {NURSERY.hours.map((day) => {
            const isToday = day.weekday === today

            return (
              <li
                key={day.weekday}
                className={isToday ? `${styles.row} ${styles.today}` : styles.row}
                aria-current={isToday ? 'date' : undefined}
              >
                <span className={styles.day}>
                  {day.label}
                  {isToday && <span className={styles.todayBadge}>Сегодня</span>}
                </span>
                <span className={styles.time}>
                  {day.opensAt}–{day.closesAt}
                </span>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
