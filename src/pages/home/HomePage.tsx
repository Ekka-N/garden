import { MapSection } from '@/widgets/map-section/MapSection'
import { ProductInfo } from '@/widgets/product-info/ProductInfo'
import { Schedule } from '@/widgets/schedule/Schedule'

export function HomePage() {
  return (
    <>
      <h1>Питомник саженцев</h1>
      <MapSection />
      <ProductInfo />
      <Schedule />
    </>
  )
}
