export interface Venue {
  address: string
  directions: string[]
  coords: { lat: number; lon: number }
  zoom: number
}

export const VENUE = {
  /** Широта (WGS-84) */
  lat: 48.300136,
  /** Долгота */
  lon: 40.149732,
  zoom: 15,
  address: "д. Поповка, Садовая ул., 8",
  /** Подсказки для гостей (можно править без кода компонента) */
  directions: [
    "С трассы сверните по указателю на Поповку.",
    "Парковка у ворот с табличкой «Саженцы».",
  ],
} as const;

/** URL встраиваемого виджета карты */
export function getYandexMapWidgetSrc(): string {
  const { lat, lon, zoom } = VENUE;
  const pt = `${VENUE.lon},${VENUE.lat}~pm2rdm`;
  return `https://yandex.ru/map-widget/v1/?ll=${lon}%2C${lat}&z=${zoom}&l=map&pt=${encodeURIComponent(pt)}`;
}

/** Ссылка «открыть в Яндекс.Картах» (центр на точке) */
export function getYandexMapsPointUrl(): string {
  const { lat, lon, zoom } = VENUE;
  return `https://yandex.ru/maps/?pt=${lon}%2C${lat}&z=${zoom}&l=map`;
}