// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

/**
 * @ignore
 */
export const environment = {
  production: false,
  backendUrl: 'https://demo.aoe.fi/api', // demo
  // backendUrl: 'https://aoe.fi/api', // prod
  frontendUrl: 'http://localhost:4200',
  fileUploadLSKey: 'aoe.fileUpload',
  newERLSKey: 'aoe.new-educational-resource',
  koodistoUrl: 'http://localhost:3000/api/v1',
  sessionCookie: 'connect.sid',
  userdataKey: 'aoe.userdata',
  cookieSettingsCookie: 'aoe.cookies',
  searchParams: 'aoe.searchParams',
  searchResults: 'aoe.searchResults',
};
