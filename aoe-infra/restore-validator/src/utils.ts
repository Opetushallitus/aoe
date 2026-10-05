import { setTimeout as sleep } from 'node:timers/promises'

const UNQUOTED_IDENTIFIER = /^[a-z_][a-z0-9_]*$/

export async function runWithDeadline<T>(
  deadline: number,
  operation: (abortSignal: AbortSignal) => Promise<T>
): Promise<T> {
  const remainingMs = deadline - Date.now()
  if (remainingMs <= 0) {
    throw new Error('Restore validator request deadline exceeded')
  }

  const controller = new AbortController()
  let timer: ReturnType<typeof setTimeout> | undefined
  try {
    const timeout = new Promise<never>((_, reject) => {
      timer = setTimeout(() => {
        const error = new Error('Restore validator request deadline exceeded')
        // Release the caller even if SDK middleware does not settle on cancellation.
        reject(error)
        controller.abort(error)
      }, remainingMs)
    })
    return await Promise.race([operation(controller.signal), timeout])
  } finally {
    clearTimeout(timer)
  }
}

/**
 * Poll for readiness until the deadline.
 * Shorten the final polling delay so waiting between attempts does not extend the time budget.
 */
export async function waitFor(
  deadline: number,
  intervalMs: number,
  description: string,
  isReady: () => Promise<boolean>
): Promise<void> {
  while (Date.now() < deadline) {
    if (await isReady()) {
      return
    }
    const remainingMs = deadline - Date.now()
    const delayMs = Math.min(intervalMs, remainingMs)
    // The readiness check may have already used up the remaining time.
    await sleep(Math.max(0, delayMs))
  }
  throw new Error(`Ran out of time waiting for ${description}`)
}

export function identifierFromArn(arn: string): string {
  const identifier = arn.split(':').pop()
  if (!identifier) {
    throw new Error(`Cannot parse an identifier from ARN: ${arn}`)
  }
  return identifier
}

export function asIdentifier(table: string): string {
  if (!UNQUOTED_IDENTIFIER.test(table)) {
    throw new Error(`Refusing to build SQL with the identifier ${table}`)
  }
  return table
}

export function describeError(err: unknown): string {
  if (err instanceof Error) {
    return `${err.name}: ${err.message}`
  }
  return String(err)
}
