export interface Venue {
  address: string
  directions: string[]
  coords: { lat: number; lon: number }
  zoom: number
}

// Плейсхолдер: заменить на реальные данные пункта выдачи.
export const VENUE: Venue = {
  address: 'Московская область, г. Солнечногорск, ул. Садовая, 1',
  directions: [
    'На автомобиле: по Ленинградскому шоссе до Солнечногорска, далее по указателям.',
    'На общественном транспорте: автобусом до остановки «Садовая».',
  ],
  coords: { lat: 56.1851, lon: 36.9776 },
  zoom: 14,
}

export function getYandexMapWidgetSrc(): string {
  const { lat, lon } = VENUE.coords
  const point = `${lon},${lat}`
  return `https://yandex.ru/map-widget/v1/?ll=${point}&z=${VENUE.zoom}&pt=${point}`
}

export function getYandexMapsPointUrl(): string {
  const { lat, lon } = VENUE.coords
  const point = `${lon},${lat}`
  return `https://yandex.ru/maps/?ll=${point}&z=${VENUE.zoom}&pt=${point}`
}
