// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

/**
 * @ignore
 */
export const environment = {
  production: false,
  loginUrl: 'https://localhost:3000/api', // 'https://demo.aoe.fi/api',
  backendUrl: 'https://localhost:3000/api/v1', // 'https://demo.aoe.fi/api/v1', // demo
  backendUrlV2: 'https://localhost:3000/api/v2', // 'https://demo.aoe.fi/api/v2',
  embedBackendUrl: 'https://localhost:3000', // 'https://lessons.demo.aoe.fi/embed', // demo
  statisticsBackendUrl: 'https://demo.aoe.fi/stat/api/statistics/prod',
  // backendUrl: 'https://aoe.fi/api', // prod
  frontendUrl: 'http://localhost:4200',
  newERLSKey: 'aoe.new-educational-resource',
  koodistoUrl: 'https://demo.aoe.fi/ref/api/v1',
  sessionCookie: 'connect.sid',
  userdataKey: 'aoe.userdata',
  cookieSettingsCookie: 'aoe.cookies',
  searchParams: 'aoe.searchParams',
  searchResults: 'aoe.searchResults',
  usedFilters: 'aoe.usedFilters',
  editMaterial: 'aoe.editMaterial',
  title: '- Avointen oppimateriaalien kirjasto (aoe.fi)',
  collection: 'aoe.collection',
  collectionSearchParams: 'aoe.collectionSearchParams',
  collectionSearchResults: 'aoe.collectionSearchResults',
  sessionMaxAge: 60 * 60 * 8 * 1000, // 8 hours
  disableForms: 'aoe.disableForms',
  disableLogin: 'aoe.disableLogin',
};
