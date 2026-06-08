import { test as seed } from '@playwright/test'
import { writeFileSync } from 'node:fs'
import { SEED_WINDOW_PATH, SEEDED_COUNT, seedOaipmhMaterials } from './helpers/seedOaipmhMaterials'

// Runs once (in the `seed` project, after `auth` and before `chromium`) so the
// OAI-PMH spec can run fully in parallel: every worker reads the persisted
// window instead of seeding its own batch. Depends on auth having written
// ./.auth/user.json — seedOaipmhMaterials uses it for the authenticated API.
seed('seed oaipmh materials', async () => {
  seed.setTimeout(180_000)
  const window = await seedOaipmhMaterials(SEEDED_COUNT)
  writeFileSync(SEED_WINDOW_PATH, `${JSON.stringify(window, null, 2)}\n`)
})
