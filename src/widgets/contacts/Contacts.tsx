import { useEffect, useRef, useState } from 'react'
import {
  Check,
  ChevronDown,
  Copy,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
} from 'lucide-react'
import { NURSERY } from '@/data/nursery'
import styles from './Contacts.module.scss'

type CopyField = 'email' | 'address'

const CONTACTS_CLOSED_KEY = 'sad-nikishin-contacts-closed'

const ADDRESS_TEXT = [
  ...NURSERY.address.lines,
  NURSERY.address.note,
].join(', ')

function readContactsClosed(): boolean {
  if (typeof window === 'undefined') {
    return false
  }

  try {
    return window.localStorage.getItem(CONTACTS_CLOSED_KEY) === '1'
  } catch {
    return false
  }
}

function writeContactsClosed(closed: boolean) {
  try {
    if (closed) {
      window.localStorage.setItem(CONTACTS_CLOSED_KEY, '1')
    } else {
      window.localStorage.removeItem(CONTACTS_CLOSED_KEY)
    }
  } catch {
    // localStorage может быть недоступен — панель просто не запомнит состояние.
  }
}

async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {
    // Переходим к запасному способу копирования.
  }

  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.setAttribute('readonly', '')
  textarea.style.position = 'fixed'
  textarea.style.top = '-1000px'
  textarea.style.opacity = '0'
  document.body.append(textarea)
  textarea.focus()
  textarea.select()
  textarea.setSelectionRange(0, textarea.value.length)

  try {
    return document.execCommand('copy')
  } catch {
    return false
  } finally {
    textarea.remove()
  }
}

export function Contacts() {
  const [isOpen, setIsOpen] = useState(() => !readContactsClosed())
  const [copied, setCopied] = useState<CopyField | null>(null)
  const [copyError, setCopyError] = useState<CopyField | null>(null)
  const timeoutRef = useRef<number | null>(null)
  const launcherRef = useRef<HTMLButtonElement>(null)
  const wasOpenRef = useRef(isOpen)

  useEffect(() => {
    if (wasOpenRef.current && !isOpen) {
      launcherRef.current?.focus()
    }

    wasOpenRef.current = isOpen
  }, [isOpen])

  useEffect(() => {
    writeContactsClosed(!isOpen)
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) {
      return
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  useEffect(
    () => () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current)
      }
    },
    [],
  )

  const handleCopy = async (field: CopyField, text: string) => {
    const isCopied = await copyText(text)

    setCopied(isCopied ? field : null)
    setCopyError(isCopied ? null : field)

    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = window.setTimeout(() => {
      setCopied(null)
      setCopyError(null)
    }, 2000)
  }

  const getCopyLabel = (field: CopyField) => {
    if (copied === field) {
      return 'Скопировано'
    }

    if (copyError === field) {
      return 'Не удалось'
    }

    return 'Копировать'
  }

  const closeContacts = () => {
    setIsOpen(false)
  }

  const openContacts = () => {
    setIsOpen(true)
  }

  const statusMessage =
    copied === 'email'
      ? 'Email скопирован.'
      : copied === 'address'
        ? 'Адрес скопирован.'
        : copyError === 'email'
          ? 'Не удалось скопировать email.'
          : copyError === 'address'
            ? 'Не удалось скопировать адрес.'
            : ''

  return (
    <div className={styles.root}>
      {isOpen ? (
        <section
          id="contacts-panel"
          className={styles.panel}
          aria-labelledby="contacts-heading"
        >
          <header className={styles.header}>
            <h2 id="contacts-heading" className={styles.title}>
              Контакты
            </h2>
            <button
              type="button"
              className={styles.toggle}
              onClick={closeContacts}
              aria-label="Свернуть контакты"
              aria-expanded="true"
              aria-controls="contacts-panel"
            >
              <ChevronDown aria-hidden strokeWidth={2} />
            </button>
          </header>

          <div className={styles.body}>
            <div className={styles.phoneBlock}>
              <span className={styles.fieldLabel}>
                <Phone
                  className={styles.fieldIcon}
                  aria-hidden
                  strokeWidth={1.75}
                />
                Телефон
              </span>
              <a className={styles.phone} href={NURSERY.phoneHref}>
                {NURSERY.phone}
              </a>
              <p className={styles.note}>{NURSERY.contactNote}</p>
              <p className={styles.messengers}>
                {NURSERY.messengers.join(' · ')}
              </p>
            </div>

            <div className={styles.field}>
              <div className={styles.fieldHeader}>
                <span className={styles.fieldLabel}>
                  <Mail
                    className={styles.fieldIcon}
                    aria-hidden
                    strokeWidth={1.75}
                  />
                  Email
                </span>
                <button
                  type="button"
                  className={styles.copyButton}
                  onClick={() => handleCopy('email', NURSERY.email)}
                  aria-label="Скопировать email"
                >
                  {copied === 'email' ? (
                    <Check aria-hidden strokeWidth={2} />
                  ) : (
                    <Copy aria-hidden strokeWidth={2} />
                  )}
                  {getCopyLabel('email')}
                </button>
              </div>
              <a className={styles.email} href={`mailto:${NURSERY.email}`}>
                {NURSERY.email}
              </a>
            </div>

            <div className={styles.field}>
              <div className={styles.fieldHeader}>
                <span className={styles.fieldLabel}>
                  <MapPin
                    className={styles.fieldIcon}
                    aria-hidden
                    strokeWidth={1.75}
                  />
                  Адрес
                </span>
                <button
                  type="button"
                  className={styles.copyButton}
                  onClick={() => handleCopy('address', ADDRESS_TEXT)}
                  aria-label="Скопировать адрес"
                >
                  {copied === 'address' ? (
                    <Check aria-hidden strokeWidth={2} />
                  ) : (
                    <Copy aria-hidden strokeWidth={2} />
                  )}
                  {getCopyLabel('address')}
                </button>
              </div>
              <address className={styles.address}>
                {NURSERY.address.lines.map((line) => (
                  <span key={line}>{line}</span>
                ))}
                <span className={styles.addressNote}>
                  {NURSERY.address.note}
                </span>
              </address>
            </div>

            <p className={styles.srOnly} aria-live="polite">
              {statusMessage}
            </p>
          </div>
        </section>
      ) : (
        <button
          ref={launcherRef}
          type="button"
          className={styles.launcher}
          onClick={openContacts}
          aria-expanded="false"
          aria-controls="contacts-panel"
        >
          <MessageCircle aria-hidden strokeWidth={1.75} />
          Контакты
        </button>
      )}
    </div>
  )
}
