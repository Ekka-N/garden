export function formatPrice(value: number): string {
  return new Intl.NumberFormat('ru-RU').format(value)
}
