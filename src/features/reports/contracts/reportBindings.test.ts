import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { arrivalNoticeBindingPaths, billOfLadingBindingPaths, invoiceBindingPaths } from './reportBindings'

describe('binding dictionary', () => {
  it('targets only invoice, bill of lading, and arrival notice paths', () => {
    const file = path.resolve(process.cwd(), 'reports/binding-dictionary.csv')
    const allowed = new Set<string>([
      ...invoiceBindingPaths,
      ...billOfLadingBindingPaths,
      ...arrivalNoticeBindingPaths,
    ])
    const rows = fs.readFileSync(file, 'utf8').trim().split(/\r?\n/).slice(1)
    expect(rows.length).toBeGreaterThan(10)
    for (const row of rows) {
      const pathName = row.split(',')[1]
      expect(allowed.has(pathName)).toBe(true)
    }
  })
})
