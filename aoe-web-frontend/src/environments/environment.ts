import { ciEnvironment } from './environment.ci';
import { demoEnvironment } from './environment.demo';
import { devEnvironment } from './environment.dev';
import { prodEnvironment } from './environment.prod';
import { qaEnvironment } from './environment.qa';

export let environment = prodEnvironment;
export function loadCiEnv() {
  environment = ciEnvironment;
}

export function loadDevEnv() {
  environment = devEnvironment;
}

export function loadDemoEnv() {
  environment = demoEnvironment;
}

export function loadQaEnv() {
  environment = qaEnvironment;
}

export function loadProdEnv() {
  environment = prodEnvironment;
}
