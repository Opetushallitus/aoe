'use strict';

const { createServer } = require('http');
const express = require('express');
const session = require('express-session');
const { Provider } = require('oidc-provider');

const ISSUER = process.env.ISSUER_URL || 'http://aoe-oidc-server';
const PORT = 80;

// Users database
const USERS = {
  aoeuser: {
    password: 'password123',
    profile: {
      sub: 'aoeuser-1',
      uid: 'c37ccf17-c8b8-4d5f-b2be-a751f8a4f46e',
      name: 'AOE User',
      given_name: 'AOE_first',
      family_name: 'AOE_last',
      email: 'aoeuser@aoe.fi',
    },
  },
  'tuomas.jukola': {
    password: 'password123',
    profile: {
      sub: 'tuomas-jukola',
      uid: 'd48ddf28-d9c9-5e6g-c3cf-b862g9b5g57f',
      name: 'Tuomas Jukola',
      given_name: 'Tuomas',
      family_name: 'Jukola',
      email: 'tuomas.jukola@aoe.fi',
    },
  },
};

// Simple in-memory adapter (not for production use)
const store = new Map();
class MemoryAdapter {
  constructor(name) {
    this.name = name;
  }

  key(id) {
    return `${this.name}:${id}`;
  }

  async upsert(id, payload, expiresIn) {
    const key = this.key(id);
    const existing = store.get(key) || {};
    store.set(key, { ...existing, ...payload });
    if (expiresIn) {
      setTimeout(() => store.delete(key), expiresIn * 1000).unref();
    }
  }

  async find(id) {
    return store.get(this.key(id));
  }

  async findByUserCode(userCode) {
    for (const [, v] of store) {
      if (v.userCode === userCode) return v;
    }
    return undefined;
  }

  async findByUid(uid) {
    for (const [, v] of store) {
      if (v.uid === uid) return v;
    }
    return undefined;
  }

  async consume(id) {
    const key = this.key(id);
    const existing = store.get(key);
    if (existing) store.set(key, { ...existing, consumed: Math.floor(Date.now() / 1000) });
  }

  async destroy(id) {
    store.delete(this.key(id));
  }

  async revokeByGrantId(grantId) {
    for (const [k, v] of store) {
      if (v.grantId === grantId) store.delete(k);
    }
  }
}

const oidcConfig = {
  adapter: MemoryAdapter,

  clients: [
    {
      client_id: 'aoe-client',
      client_secret: 'aoe-secret',
      redirect_uris: (process.env.EXTRA_REDIRECT_URIS
        ? ['https://demo.aoe.fi/api/secure/redirect', ...process.env.EXTRA_REDIRECT_URIS.split(',')]
        : ['https://demo.aoe.fi/api/secure/redirect']),
      grant_types: ['authorization_code'],
      response_types: ['code'],
      scope: 'openid',
      token_endpoint_auth_method: 'client_secret_basic',
    },
  ],

  // Disable PKCE entirely — do not advertise it and reject any params
  pkce: {
    required: () => false,
    methods: [],
  },

  scopes: ['openid'],

  // Shibboleth discovery only lists standard claims, but returns uid via userinfo
  claims: {
    openid: ['sub', 'name', 'given_name', 'family_name', 'email', 'uid'],
  },

  async findAccount(_ctx, id) {
    // Find user by sub
    const user = Object.values(USERS).find((u) => u.profile.sub === id);
    if (!user) return undefined;
    return {
      accountId: id,
      async claims() {
        return {
          sub: user.profile.sub,
          name: user.profile.name,
          given_name: user.profile.given_name,
          family_name: user.profile.family_name,
          email: user.profile.email,
          uid: user.profile.uid,
        };
      },
    };
  },

  features: {
    devInteractions: { enabled: false },
  },

  // Match Shibboleth: only authorization_code, no implicit/refresh
  responseTypes: ['code'],
  grantTypes: ['authorization_code'],

  cookies: {
    keys: ['mock-oidc-cookie-secret-local-dev-only'],
    short: { sameSite: 'lax', signed: true },
    long: { sameSite: 'lax', signed: true },
  },

  ttl: {
    Interaction: 3600,
    AuthorizationCode: 600,
    AccessToken: 3600,
    Session: 86400 * 7,
    Grant: 86400 * 14,
  },

  // Interaction URL — we serve the login form ourselves
  interactions: {
    url(_ctx, interaction) {
      return `/interaction/${interaction.uid}`;
    },
  },

  // Expose public keys in discovery
  jwks: undefined, // will be generated automatically

  renderError(ctx, out, _error) {
    ctx.type = 'html';
    ctx.body = `<!DOCTYPE html><html><body>
      <h1>Error</h1>
      <pre>${JSON.stringify(out, null, 2)}</pre>
    </body></html>`;
  },
};

async function main() {
  const provider = new Provider(ISSUER, oidcConfig);

  // Reject PKCE params at the authorization endpoint before oidc-provider handles them.
  // This is the core behaviour: actively 400 any request that sends code_challenge.
  // Reject PKCE params before oidc-provider handles the authorization request
  provider.use(async (ctx, next) => {
    if (ctx.path === '/auth' && ctx.method === 'GET') {
      const { code_challenge, code_verifier } = ctx.query;
      if (code_challenge !== undefined || code_verifier !== undefined) {
        ctx.status = 400;
        ctx.type = 'json';
        ctx.body = JSON.stringify({
          error: 'invalid_request',
          error_description: 'PKCE is not supported. Do not send code_challenge or code_verifier.',
        });
        return;
      }
    }
    await next();
    // Make discovery match Shibboleth (auth.demo.aoe.fi) exactly
    if (ctx.path === '/.well-known/openid-configuration' && ctx.status === 200 && ctx.body) {
      delete ctx.body.code_challenge_methods_supported;
      delete ctx.body.authorization_response_iss_parameter_supported;
      delete ctx.body.pushed_authorization_request_endpoint;
      delete ctx.body.dpop_signing_alg_values_supported;
      delete ctx.body.claim_types_supported;
      delete ctx.body.end_session_endpoint;
      ctx.body.claims_parameter_supported = true;
      ctx.body.request_parameter_supported = true;
      ctx.body.display_values_supported = ['page'];
    }
  });

  const app = express();
  app.use(
    session({
      secret: 'mock-oidc-session-secret-local-dev-only',
      resave: false,
      saveUninitialized: false,
      cookie: { sameSite: 'lax' },
    }),
  );

  // Login form — GET
  app.get('/interaction/:uid', async (req, res, next) => {
    try {
      const details = await provider.interactionDetails(req, res);
      const { uid, prompt, params } = details;

      if (prompt.name !== 'login') {
        // Consent — auto-grant
        return await handleConsent(provider, req, res, details);
      }

      const error = req.session.loginError;
      delete req.session.loginError;

      res.setHeader('Content-Type', 'text/html');
      res.end(loginForm(uid, params.client_id, error));
    } catch (err) {
      next(err);
    }
  });

  // Login form — POST
  app.post('/interaction/:uid/login', express.urlencoded({ extended: false }), async (req, res, next) => {
    try {
      const details = await provider.interactionDetails(req, res);
      const { uid } = details;
      const { username, password } = req.body;

      const user = USERS[username];
      if (!user || user.password !== password) {
        req.session.loginError = 'Invalid username or password.';
        return res.redirect(`/interaction/${uid}`);
      }

      const result = {
        login: {
          accountId: user.profile.sub,
        },
      };

      await provider.interactionFinished(req, res, result, {
        mergeWithLastSubmission: false,
      });
    } catch (err) {
      next(err);
    }
  });

  async function handleConsent(provider, req, res, details) {
    const { prompt, params, session: { accountId } = {} } = details;
    const grant = details.grantId
      ? await provider.Grant.find(details.grantId)
      : new provider.Grant({
          accountId,
          clientId: params.client_id,
        });

    if (prompt.details.missingOIDCScope) {
      grant.addOIDCScope(prompt.details.missingOIDCScope.join(' '));
    }
    if (prompt.details.missingOIDCClaims) {
      grant.addOIDCClaims(prompt.details.missingOIDCClaims);
    }
    if (prompt.details.missingResourceScopes) {
      for (const [resource, scopes] of Object.entries(prompt.details.missingResourceScopes)) {
        grant.addResourceScope(resource, scopes.join(' '));
      }
    }

    const grantId = await grant.save();

    await provider.interactionFinished(req, res, { consent: { grantId } }, {
      mergeWithLastSubmission: true,
    });
  }

  // Consent — POST (auto-grant, same as above)
  app.post('/interaction/:uid/confirm', async (req, res, next) => {
    try {
      const details = await provider.interactionDetails(req, res);
      await handleConsent(provider, req, res, details);
    } catch (err) {
      next(err);
    }
  });

  // Mount the oidc-provider on /
  app.use((req, res) => provider.callback()(req, res));

  createServer(app).listen(PORT, () => {
    console.log(`node-oidc-provider mock running at ${ISSUER} (port ${PORT})`);
    console.log(`Discovery: ${ISSUER}/.well-known/openid-configuration`);
  });
}

function loginForm(uid, clientId, error) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>AOE Mock OIDC Login</title>
  <style>
    body { font-family: sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background: #f5f5f5; }
    .card { background: #fff; padding: 2rem; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,.15); min-width: 320px; }
    h2 { margin-top: 0; }
    label { display: block; margin-top: 1rem; font-weight: bold; }
    input { width: 100%; padding: .5rem; margin-top: .25rem; box-sizing: border-box; border: 1px solid #ccc; border-radius: 4px; }
    button { margin-top: 1.5rem; width: 100%; padding: .75rem; background: #1a73e8; color: #fff; border: none; border-radius: 4px; cursor: pointer; font-size: 1rem; }
    .error { color: #c62828; margin-top: .75rem; }
    .hint { color: #666; font-size: .85rem; margin-top: 1rem; }
  </style>
</head>
<body>
  <div class="card">
    <h2>AOE Mock OIDC</h2>
    <p>Client: <strong>${clientId}</strong></p>
    ${error ? `<p class="error">${error}</p>` : ''}
    <form method="POST" action="/interaction/${uid}/login">
      <label for="username">Username</label>
      <input id="username" name="username" type="text" autocomplete="username" required />
      <label for="password">Password</label>
      <input id="password" name="password" type="password" autocomplete="current-password" required />
      <button type="submit">Sign in</button>
    </form>
    <p class="hint">Test users: <code>aoeuser / password123</code> or <code>tuomas.jukola / password123</code></p>
  </div>
</body>
</html>`;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
