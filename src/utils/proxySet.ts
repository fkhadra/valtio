import { proxy } from 'valtio'

// properies that we don't want to expose to the end-user
type InternalProxySet<T> = Set<T> & {
  data: T[]
  toJSON: object
  hasProxy(value: T): boolean
}

export const proxySet = <T>(initialValues: Iterable<T> | null = []): Set<T> => {
  const set: InternalProxySet<T> = proxy({
    data: Array.from(new Set(initialValues)),
    has(value) {
      return this.data.indexOf(value) !== -1
    },
    hasProxy(value) {
      let hasProxy = false
      if (typeof value === 'object' && value !== null) {
        hasProxy = this.data.indexOf(proxy(value as any)) !== -1
      }
      return hasProxy
    },
    add(value) {
      if (!this.has(value) && !this.hasProxy(value)) {
        this.data.push(value)
      }
      return this
    },
    delete(value) {
      const index = this.data.indexOf(value)
      if (index === -1) {
        return false
      }
      this.data.splice(index, 1)
      return true
    },
    clear() {
      this.data.splice(0)
    },
    get size() {
      return this.data.length
    },
    forEach(cb) {
      this.data.forEach((value) => {
        cb(value, value, this)
      })
    },
    get [Symbol.toStringTag]() {
      return 'Set'
    },
    toJSON() {
      return {}
    },
    [Symbol.iterator]() {
      return this.data[Symbol.iterator]()
    },
    values() {
      return this.data.values()
    },
    keys() {
      // for Set.keys is an alias for Set.values()
      return this.data.values()
    },
    entries() {
      // array.entries returns [index, value] while Set [value, value]
      return new Set(this.data).entries()
    },
  })

  Object.defineProperties(set, {
    data: {
      writable: true,
      enumerable: false,
    },
    size: {
      enumerable: false,
    },
    hasProxy: {
      enumerable: false,
    },
    toJSON: {
      enumerable: false,
    },
  })

  Object.seal(set)

  return set as Set<T>
}
