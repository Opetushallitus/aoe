// Resolves tsconfig `paths` aliases (@util/*, @/*, …) for `node --test`, which
// can't load runtime alias imports on its own. Loaded via --import in the
// backend "test" script. Zero dependencies — uses Node's built-in resolve hook.
import { registerHooks } from 'node:module'
import { readFileSync, existsSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'
import path from 'node:path'

const projectRoot = fileURLToPath(new URL('..', import.meta.url))
const { compilerOptions } = JSON.parse(
  readFileSync(new URL('../tsconfig.json', import.meta.url), 'utf8')
)

const aliases = Object.entries(compilerOptions.paths ?? {}).map(([alias, [target]]) => [
  alias.replace(/\*$/, ''),
  target.replace(/^\.\//, '').replace(/\*$/, '')
])

const resolveFile = (base) =>
  [`${base}.ts`, path.join(base, 'index.ts'), base].find((candidate) => existsSync(candidate))

registerHooks({
  resolve(specifier, context, nextResolve) {
    for (const [prefix, target] of aliases) {
      if (specifier.startsWith(prefix)) {
        const file = resolveFile(path.join(projectRoot, target, specifier.slice(prefix.length)))
        if (file) {
          return { url: pathToFileURL(file).href, shortCircuit: true }
        }
      }
    }
    return nextResolve(specifier, context)
  }
})
