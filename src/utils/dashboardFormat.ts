import { formatDate } from '@/utils/formatDate'

export function monthLabel(key: string): string {
  const date = new Date(`${key}-01T12:00:00`)
  if (Number.isNaN(date.getTime())) return key
  return new Intl.DateTimeFormat('es-CO', { month: 'short', year: '2-digit' }).format(date)
}

export function weekLabel(key: string): string {
  return formatDate(key, 'dd/MM')
}

export function weekLabelLong(key: string): string {
  return `Semana del ${formatDate(key)}`
}

export function dayLabelLong(key: string): string {
  return formatDate(key)
}
