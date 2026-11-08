import { downloadBlob } from './downloadBlob'

function escapeCell(value: string): string {
  return /[";\r\n]/.test(value) ? `"${value.replaceAll('"', '""')}"` : value
}

/** Скачивает CSV с BOM и разделителем `;`, чтобы файл корректно открывался в Excel. */
export function downloadCsv(filename: string, rows: string[][]): void {
  const content = rows.map((row) => row.map(escapeCell).join(';')).join('\r\n')
  const blob = new Blob(['\uFEFF', content], { type: 'text/csv;charset=utf-8;' })

  downloadBlob(filename, blob)
}
