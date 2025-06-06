import { ciEnvironment } from "./environment.ci";
import { demoEnvironment } from "./environment.demo";
import { devEnvironment } from "./environment.dev";
import { prodEnvironment } from "./environment.prod";
import { qaEnvironment } from "./environment.qa";

export let environment = {
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

export function loadCiEnv() {
  environment = ciEnvironment
}

export function loadDevEnv() {
  environment = devEnvironment
}

export function loadDemoEnv() {
  environment = demoEnvironment
}

export function loadQaEnv() {
  environment = qaEnvironment
}

export function loadProdEnv() {
  environment = prodEnvironment
}

