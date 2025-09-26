import { AsyncLocalStorage } from 'async_hooks'

interface Storage {
  requestId: string
}

export const asyncLocalStorage = new AsyncLocalStorage<Storage>()
