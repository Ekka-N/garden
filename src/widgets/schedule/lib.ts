import type { WorkingDay } from '@/data/nursery'

export function toMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)

  return hours * 60 + minutes
}

export type ScheduleStatus =
  | { state: 'open'; closesAt: string }
  | { state: 'closed' }

export function getScheduleStatus(
  day: WorkingDay | undefined,
  now: Date,
  enabled = true,
): ScheduleStatus {
  if (!enabled || !day) {
    return { state: 'closed' }
  }

  const minutes = now.getHours() * 60 + now.getMinutes()
  const opensAt = toMinutes(day.opensAt)
  const closesAt = toMinutes(day.closesAt)

  if (minutes >= opensAt && minutes < closesAt) {
    return { state: 'open', closesAt: day.closesAt }
  }

  return { state: 'closed' }
}

export function getStatusLabel(status: ScheduleStatus): string {
  switch (status.state) {
    case 'open':
      return `Открыто до ${status.closesAt}`
    case 'closed':
      return 'Закрыто'
  }
}
