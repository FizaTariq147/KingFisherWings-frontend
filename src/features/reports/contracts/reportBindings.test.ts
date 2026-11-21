import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  arrivalNoticeBindingPaths,
  billOfLadingBindingPaths,
  bindingPathsByFamily,
  documentBindingPaths,
  invoiceBindingPaths,
} from './reportBindings'

describe('binding dictionary', () => {
  it('targets only invoice, bill of lading, arrival notice, and document paths', () => {
    const file = path.resolve(process.cwd(), 'reports/binding-dictionary.csv')
    const allowed = new Set<string>([
      ...invoiceBindingPaths,
      ...billOfLadingBindingPaths,
      ...arrivalNoticeBindingPaths,
      ...documentBindingPaths,
    ])
    const rows = fs.readFileSync(file, 'utf8').trim().split(/\r?\n/).slice(1)
    expect(rows.length).toBeGreaterThan(10)
    for (const row of rows) {
      const pathName = row.split(',')[1]
      expect(allowed.has(pathName)).toBe(true)
    }
  })

  it('document paths extend the arrival notice set without duplicates', () => {
    for (const pathName of arrivalNoticeBindingPaths) {
      expect(documentBindingPaths).toContain(pathName)
    }
    expect(new Set(documentBindingPaths).size).toBe(documentBindingPaths.length)
    expect(bindingPathsByFamily.document).toBe(documentBindingPaths)
  })
})
