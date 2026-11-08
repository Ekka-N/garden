import { describe, expect, it } from 'vitest'
import { formatDate } from './formatDate'

describe('formatDate', () => {
  it('форматирует ISO-дату по-русски', () => {
    expect(formatDate('2026-10-01')).toContain('1 октября 2026')
  })

  it('возвращает исходную строку для некорректной даты', () => {
    expect(formatDate('не дата')).toBe('не дата')
  })
})
