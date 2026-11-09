import { Sprout } from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'
import { NURSERY } from '@/data/nursery'
import { Contacts } from '@/widgets/contacts/Contacts'
import styles from './PageLayout.module.scss'

const navLinkClassName = ({ isActive }: { isActive: boolean }) =>
  isActive ? styles.activeLink : styles.link

export function PageLayout() {
  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <NavLink to="/" className={styles.brand} end>
          <Sprout aria-hidden strokeWidth={1.75} />
          {NURSERY.name}
        </NavLink>
        <nav className={styles.nav} aria-label="Основная навигация">
          <NavLink to="/" end className={navLinkClassName}>
            Главная
          </NavLink>
          <NavLink to="/recommendations" className={navLinkClassName}>
            Рекомендации
          </NavLink>
          <NavLink to="/price-list" className={navLinkClassName}>
            Прайс-лист
          </NavLink>
        </nav>
      </header>
      <main className={styles.main}>
        <Outlet />
      </main>
      <footer className={styles.footer}>
        <p>© {new Date().getFullYear()} {NURSERY.name}</p>
      </footer>
      <Contacts />
    </div>
  )
}
