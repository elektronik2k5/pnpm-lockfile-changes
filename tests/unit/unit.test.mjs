import { test } from 'node:test'
import fs from 'node:fs'
import path from 'node:path'

import { parsePnpmLockFile } from '../../src/parser.mjs'
import { diffLocks, STATUS, countStatuses } from '../../src/utils.mjs'
import assert from 'node:assert'

const readLock = (filepath) =>
  fs.readFileSync(path.resolve(process.cwd(), filepath), { encoding: 'utf-8' })

test('parses a real pnpm lockfile correctly', () => {
  const { dependencies } = parsePnpmLockFile(readLock('tests/ci/pnpm-lock.yaml'))

  assert.ok(dependencies.lodash)
  assert.equal(dependencies.lodash.version, '4.18.1')
})

test('calculating the diff of two lockfiles works', () => {
  const result = diffLocks(
    parsePnpmLockFile(readLock('tests/ci/pnpm-lock.yaml')),
    parsePnpmLockFile(readLock('tests/unit/downgrade/b.yaml'))
  )

  assert.equal(Object.keys(result).length, 6)
  assert.equal(countStatuses(result, STATUS.ADDED), 5)
  assert.equal(countStatuses(result, STATUS.UPDATED), 0)
  assert.equal(countStatuses(result, STATUS.DOWNGRADED), 1)
  assert.equal(countStatuses(result, STATUS.REMOVED), 0)
})
