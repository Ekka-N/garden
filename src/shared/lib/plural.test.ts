import { describe, expect, it } from 'vitest'
import { pluralRu } from './plural'

describe('pluralRu', () => {
  it('выбирает форму для единственного числа', () => {
    expect(pluralRu(1, 'сорт', 'сорта', 'сортов')).toBe('сорт')
    expect(pluralRu(21, 'сорт', 'сорта', 'сортов')).toBe('сорт')
  })

  it('выбирает форму для 2–4', () => {
    expect(pluralRu(2, 'сорт', 'сорта', 'сортов')).toBe('сорта')
    expect(pluralRu(24, 'сорт', 'сорта', 'сортов')).toBe('сорта')
  })

  it('выбирает форму для 5+ и исключений 11–14', () => {
    expect(pluralRu(5, 'сорт', 'сорта', 'сортов')).toBe('сортов')
    expect(pluralRu(11, 'сорт', 'сорта', 'сортов')).toBe('сортов')
    expect(pluralRu(12, 'сорт', 'сорта', 'сортов')).toBe('сортов')
    expect(pluralRu(14, 'сорт', 'сорта', 'сортов')).toBe('сортов')
  })
})
