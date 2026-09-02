import { setTimeout as sleep } from 'node:timers/promises'

const UNQUOTED_IDENTIFIER = /^[a-z_][a-z0-9_]*$/

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
    await sleep(intervalMs)
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
