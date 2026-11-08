import { downloadBlob } from '@/shared/lib/downloadBlob'
import type { PriceCategory } from '../model/types'
import { EXPORT_COLUMNS, buildExportRows } from './exportRows'

const HEADER_FILL = 'FF4A6B3A'
const XLSX_MIME =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'

/** Формирует и скачивает Excel с одним сводным листом. */
export async function downloadPriceListExcel(
  categories: PriceCategory[],
  filename: string,
): Promise<void> {
  type ExcelJsModule = typeof import('exceljs')

  const module = (await import('exceljs')) as ExcelJsModule & {
    default?: ExcelJsModule
  }
  const ExcelJS = module.default ?? module
  const workbook = new ExcelJS.Workbook()

  workbook.creator = 'Питомник'
  workbook.created = new Date()

  const sheet = workbook.addWorksheet('Прайс-лист', {
    views: [{ state: 'frozen', ySplit: 1 }],
    pageSetup: {
      orientation: 'landscape',
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
      printTitlesRow: '1:1',
      margins: {
        left: 0.4,
        right: 0.4,
        top: 0.5,
        bottom: 0.5,
        header: 0.2,
        footer: 0.2,
      },
    },
  })

  sheet.columns = EXPORT_COLUMNS.map((column) => ({
    header: column.title,
    key: column.key,
    width: column.width,
  }))

  const headerRow = sheet.getRow(1)

  headerRow.height = 30
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } }
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: HEADER_FILL },
  }
  headerRow.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true }

  const rows = buildExportRows(categories)

  for (const row of rows) {
    const sheetRow = sheet.addRow({
      category: row.category,
      section: row.section,
      name: row.name,
      ripening: row.ripening,
      note: row.note,
      isNew: row.isNew,
      price: row.price,
      availability: row.availability,
    })

    sheetRow.eachCell((cell, columnNumber) => {
      cell.alignment = {
        vertical: 'top',
        wrapText: columnNumber === 5,
      }
    })

    sheetRow.getCell('price').numFmt = '0'
    sheetRow.getCell('price').alignment = {
      vertical: 'top',
      horizontal: 'right',
    }
    sheetRow.getCell('isNew').alignment = {
      vertical: 'top',
      horizontal: 'center',
    }
  }

  sheet.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: Math.max(1, rows.length + 1), column: EXPORT_COLUMNS.length },
  }

  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer], { type: XLSX_MIME })

  downloadBlob(filename, blob)
}
