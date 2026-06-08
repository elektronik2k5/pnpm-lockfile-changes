const fs = require('node:fs')
const path = require('node:path')
const { parsePnpmLockFile } = require('../../src/parser.jsm')
const { diffLocks, STATUS, countStatuses } = require('../../src/utils')

const readLock = (filepath) =>
  fs.readFileSync(path.resolve(process.cwd(), filepath), { encoding: 'utf-8' })

test('parses a real pnpm lockfile correctly', () => {
  const { dependencies } = parsePnpmLockFile(readLock('tests/ci/pnpm-lock.yaml'))

  expect(dependencies.lodash).toBeDefined()
  expect(dependencies.lodash.version).toBe('4.18.1')
})

test('calculating the diff of two lockfiles works', () => {
  const result = diffLocks(
    parsePnpmLockFile(readLock('tests/ci/pnpm-lock.yaml')),
    parsePnpmLockFile(readLock('tests/unit/downgrade/b.yaml'))
  )

  expect(Object.keys(result).length).toBe(6)
  expect(countStatuses(result, STATUS.ADDED)).toBe(5)
  expect(countStatuses(result, STATUS.UPDATED)).toBe(0)
  expect(countStatuses(result, STATUS.DOWNGRADED)).toBe(1)
  expect(countStatuses(result, STATUS.REMOVED)).toBe(0)
})
