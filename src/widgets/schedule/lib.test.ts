import { describe, expect, it } from 'vitest'
import type { WorkingDay } from '@/data/nursery'
import { getScheduleStatus, getStatusLabel, toMinutes } from './lib'

const day: WorkingDay = {
  weekday: 1,
  label: 'Понедельник',
  opensAt: '8:30',
  closesAt: '17:30',
}

const at = (hours: number, minutes: number) =>
  new Date(2026, 10, 9, hours, minutes)

describe('toMinutes', () => {
  it('переводит время в минуты', () => {
    expect(toMinutes('8:30')).toBe(510)
    expect(toMinutes('16:00')).toBe(960)
  })
})

describe('getScheduleStatus', () => {
  it('считает день открытым в рабочие часы', () => {
    expect(getScheduleStatus(day, at(12, 0))).toEqual({
      state: 'open',
      closesAt: '17:30',
    })
  })

  it('считает день открытым ровно в момент открытия', () => {
    expect(getScheduleStatus(day, at(8, 30))).toEqual({
      state: 'open',
      closesAt: '17:30',
    })
  })

  it('считает день закрытым ровно в момент закрытия', () => {
    expect(getScheduleStatus(day, at(17, 30))).toEqual({ state: 'closed' })
  })

  it('показывает время открытия до начала смены', () => {
    expect(getScheduleStatus(day, at(7, 0))).toEqual({
      state: 'opens-soon',
      opensAt: '8:30',
    })
  })

  it('считает день закрытым, если данных о дне нет', () => {
    expect(getScheduleStatus(undefined, at(12, 0))).toEqual({
      state: 'closed',
    })
  })
})

describe('getStatusLabel', () => {
  it('формирует подписи для всех состояний', () => {
    expect(getStatusLabel({ state: 'open', closesAt: '17:30' })).toBe(
      'Открыто до 17:30',
    )
    expect(getStatusLabel({ state: 'opens-soon', opensAt: '8:30' })).toBe(
      'Откроется в 8:30',
    )
    expect(getStatusLabel({ state: 'closed' })).toBe('Закрыто')
  })
})
