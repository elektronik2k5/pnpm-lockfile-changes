import yaml from 'js-yaml'

/**
 * @typedef {{ name: string, version: string }} LockEntry
 * @typedef {{ [name: string]: { version: string } }} Dependencies
 * @typedef {{ dependencies: Dependencies }} ParsedLockFile
 * @typedef {{ packages?: Record<string, unknown> }} PnpmLockFile
 */

/**
 * @param {string} key
 * @returns {LockEntry}
 */
const parsePnpmLockEntry = (key) => {
  /** @type {string} */
  const normalized = key.startsWith('/') ? key.slice(1) : key
  /** @type {string} */
  const withoutPeers = normalized.replace(/\([^)]*\)$/, '')
  /** @type {number} */
  const atIdx = withoutPeers.lastIndexOf('@')
  if (atIdx > 0) {
    return { name: withoutPeers.slice(0, atIdx), version: withoutPeers.slice(atIdx + 1) }
  }
  // v5 format: name/version (slash-separated, no @ version separator)
  /** @type {number} */
  const lastSlash = withoutPeers.lastIndexOf('/')
  return { name: withoutPeers.slice(0, lastSlash), version: withoutPeers.slice(lastSlash + 1) }
}

/**
 * @param {string} content
 * @returns {ParsedLockFile}
 */
export const parsePnpmLockFile = (content) => {
  /** @type {PnpmLockFile} */
  const lockfile = /** @type {PnpmLockFile} */ (yaml.load(content))
  /** @type {Record<string, unknown>} */
  const packages = lockfile.packages ?? {}
  /** @type {Dependencies} */
  const dependencies = {}

  for (const key of Object.keys(packages)) {
    /** @type {LockEntry} */
    const { name, version } = parsePnpmLockEntry(key)
    if (name && version) {
      dependencies[name] = { version }
    }
  }

  return { dependencies }
}
