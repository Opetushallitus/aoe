import { getMaterialMetaData } from '@query/oaipmh';
import { Router } from 'express';

/**
 * API version 1.0 for requesting files and metadata related to stored educational material.
 * This module is a collection of legacy endpoints starting with /oaipmh*.
 * Endpoints ordered by the request URL (1) and method (2).
 * @param router express.Router
 */
export default (router: Router): void => {
  const moduleRoot = '/oaipmh';

  router.post(`${moduleRoot}/metadata`, getMaterialMetaData);
};
