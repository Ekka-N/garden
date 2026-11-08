const dateFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

/** Форматирует ISO-дату (YYYY-MM-DD) без сдвига часового пояса. */
export function formatDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number)

  if (!year || !month || !day) {
    return isoDate
  }

  return dateFormatter.format(new Date(year, month - 1, day))
}
