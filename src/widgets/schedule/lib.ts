import type { WorkingDay } from '@/data/nursery'

export function toMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)

  return hours * 60 + minutes
}

export type ScheduleStatus =
  | { state: 'open'; closesAt: string }
  | { state: 'opens-soon'; opensAt: string }
  | { state: 'closed' }

export function getScheduleStatus(
  day: WorkingDay | undefined,
  now: Date,
): ScheduleStatus {
  if (!day) {
    return { state: 'closed' }
  }

  const minutes = now.getHours() * 60 + now.getMinutes()
  const opensAt = toMinutes(day.opensAt)
  const closesAt = toMinutes(day.closesAt)

  if (minutes >= opensAt && minutes < closesAt) {
    return { state: 'open', closesAt: day.closesAt }
  }

  if (minutes < opensAt) {
    return { state: 'opens-soon', opensAt: day.opensAt }
  }

  return { state: 'closed' }
}

export function getStatusLabel(status: ScheduleStatus): string {
  switch (status.state) {
    case 'open':
      return `Открыто до ${status.closesAt}`
    case 'opens-soon':
      return `Откроется в ${status.opensAt}`
    case 'closed':
      return 'Закрыто'
  }
}
