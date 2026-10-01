# Local Development

Start the entire stack:
```bash
./start-local-env.sh
```

This generates a self-signed cert for NGINX and starts all services via Docker Compose in a tmux session.

Access at: https://demo.aoe.fi/ (requires host file entry)

Mock OIDC credentials:
- aoeuser/password123
- tuomas.jukola/password123

## Linting

```bash
./scripts/fix-lint.sh         # Fix lint across all services with Biome
```

## Playwright Tests

```bash
./run-tests.sh                # Run from repo root
```

Use `taytaJaTallennaUusiMateriaali()` to create materials and `pressSequentially()` for inputs with key handlers. See [playwright-tests.md](playwright-tests.md).
