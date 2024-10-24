import { winstonLogger } from '../util';

const missingEnvs: string[] = [];
process.env.LOG_LEVEL || missingEnvs.push('LOG_LEVEL');
process.env.PORT_LISTEN || missingEnvs.push('PORT_LISTEN');
process.env.EXTERNAL_API_CALLERID_OID || missingEnvs.push('EXTERNAL_API_CALLERID_OID');
process.env.EXTERNAL_API_CALLERID_SERVICE || missingEnvs.push('EXTERNAL_API_CALLERID_SERVICE');
process.env.EXTERNAL_API_OPINTOPOLKU_EPERUSTEET || missingEnvs.push('EXTERNAL_API_OPINTOPOLKU_EPERUSTEET');
process.env.EXTERNAL_API_OPINTOPOLKU_KOODISTOT || missingEnvs.push('EXTERNAL_API_OPINTOPOLKU_KOODISTOT');
process.env.EXTERNAL_API_OPINTOPOLKU_ORGANISAATIOT || missingEnvs.push('EXTERNAL_API_OPINTOPOLKU_ORGANISAATIOT');
process.env.EXTERNAL_API_FINTO_ASIASANAT || missingEnvs.push('EXTERNAL_API_FINTO_ASIASANAT');
process.env.EXTERNAL_API_SUOMI_KOODISTOT || missingEnvs.push('EXTERNAL_API_SUOMI_KOODISTOT');
process.env.REDIS_HOST || missingEnvs.push('REDIS_HOST');
process.env.REDIS_PASS || missingEnvs.push('REDIS_PASS');
process.env.REDIS_PORT || missingEnvs.push('REDIS_PORT');

if (missingEnvs.length > 0) {
  winstonLogger.error('All required environment variables are not available: %s', missingEnvs);
  process.exit(1);
}

export default {
  // Application properties.
  APP: {
    logLevel: process.env.LOG_LEVEL as string,
    portListen: parseInt(process.env.PORT_LISTEN as string, 10) as number,
  },

  // External APIs.
  EXTERNAL_API: {
    oid: process.env.EXTERNAL_API_CALLERID_OID as string,
    service: process.env.EXTERNAL_API_CALLERID_SERVICE as string,
    ePerusteet: process.env.EXTERNAL_API_OPINTOPOLKU_EPERUSTEET as string,
    opintopolkuKoodistot: process.env.EXTERNAL_API_OPINTOPOLKU_KOODISTOT as string,
    organisaatiot: process.env.EXTERNAL_API_OPINTOPOLKU_ORGANISAATIOT as string,
    asiasanat: process.env.EXTERNAL_API_FINTO_ASIASANAT as string,
    suomiKoodistot: process.env.EXTERNAL_API_SUOMI_KOODISTOT as string,
  },

  // Configuration for Redis database connections.
  REDIS_OPTIONS: {
    host: process.env.REDIS_HOST as string,
    pass: process.env.REDIS_PASS as string,
    port: (parseInt(process.env.REDIS_PORT as string, 10) as number) || 6379,
  },
} as any;
