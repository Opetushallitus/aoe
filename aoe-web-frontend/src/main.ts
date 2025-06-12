import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment, loadCiEnv, loadDemoEnv, loadDevEnv, loadProdEnv, loadQaEnv } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

fetch('./assets/config/config.json')
	.then((resp) => resp.json())
	.then((config) => {
    if (config.env === "ci") {
      loadCiEnv()
    } else if (config.env === "dev") {
      loadDevEnv()
    } else if (config.env === "demo") {
      loadDemoEnv()
    } else if (config.env === "qa") {
      loadQaEnv()
    } else if (config.env === "prod") {
      loadProdEnv()
    }
    platformBrowserDynamic()
      .bootstrapModule(AppModule)
      .catch((err) => console.log(err));
	});

