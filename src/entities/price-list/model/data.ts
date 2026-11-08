import type { PriceCategory, PriceGroup, PriceRow } from './types'
import apples from './data/apples.json'
import apricots from './data/apricots.json'
import berries from './data/berries.json'
import cherries from './data/cherries.json'
import decor from './data/decor.json'
import grapes from './data/grapes.json'
import mulberry from './data/mulberry.json'
import nuts from './data/nuts.json'
import other from './data/other.json'
import pears from './data/pears.json'
import plums from './data/plums.json'
import quince from './data/quince.json'
import roses from './data/roses.json'

type RawRow = Omit<PriceRow, 'id'>
type RawGroup = Omit<PriceGroup, 'rows'> & { rows: RawRow[] }
type RawCategory = Omit<PriceCategory, 'rows' | 'groups'> & {
  rows?: RawRow[]
  groups?: RawGroup[]
}

/** Проставляет стабильные id строкам и собирает категорию из JSON-файла. */
function withIds(raw: RawCategory): PriceCategory {
  let rowIndex = 0

  const attachIds = (rows: RawRow[]): PriceRow[] =>
    rows.map((row) => {
      rowIndex += 1

      return { ...row, id: `${raw.id}-${rowIndex}` }
    })

  const groups = raw.groups?.map((group) => ({
    ...group,
    rows: attachIds(group.rows),
  }))

  return {
    id: raw.id,
    title: raw.title,
    ...(raw.shortTitle ? { shortTitle: raw.shortTitle } : {}),
    updatedAt: raw.updatedAt,
    rows: raw.rows ? attachIds(raw.rows) : [],
    ...(groups ? { groups } : {}),
  }
}

export const priceCategories: PriceCategory[] = [
  withIds(cherries),
  withIds(apricots),
  withIds(apples),
  withIds(pears),
  withIds(plums),
  withIds(berries),
  withIds(quince),
  withIds(nuts),
  withIds(mulberry),
  withIds(decor),
  withIds(grapes),
  withIds(roses),
  withIds(other),
]
