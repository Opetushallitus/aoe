# Local Development

Run `task` to see the common commands in workflow order. They wrap the repo's scripts via `taskfile.yml`. `task` is [go-task](https://taskfile.dev); without it, call the wrapped script directly. Pass arguments to the wrapped script after `--`; `task --summary <task>` lists the arguments a task takes.

Start the entire stack:
```bash
task start                    # wraps ./start-local-env.sh
```

This generates a self-signed cert for NGINX and starts all services via Docker Compose in a tmux session.

Access at: https://demo.aoe.fi/ (requires host file entry)

Mock OIDC credentials:
- aoeuser/password123
- tuomas.jukola/password123

## Linting

```bash
task lint                     # Check lint with Biome, read-only (what CI runs)
task lint:fix                 # Fix lint across all services with Biome
```

## Playwright Tests

```bash
task test                     # Backend unit tests + Playwright; flags after -- go to Playwright
task test:ui                  # Playwright UI
```

Use `taytaJaTallennaUusiMateriaali()` to create materials and `pressSequentially()` for inputs with key handlers. See [playwright-tests.md](playwright-tests.md).
