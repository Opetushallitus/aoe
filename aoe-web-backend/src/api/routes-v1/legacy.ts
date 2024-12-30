import collection from '@/collection/collection';
import { changeMaterialUser, getAoeUsers, getMaterialNames, removeEducationalMaterial } from '@/controllers/material';
import { downloadPdfFromAllas } from '@/helpers/officeToPdfConverter';
import {
  addMetadataExtension,
  getMetadataExtension,
  getUsersMetadataExtension,
} from '@/metadataExtension/metadataExtension';
import rating from '@/rating/rating';
import { updateUserSettings } from '@/users/userSettings';
import db from '@query/apiQueries';
import fileHandling from '@query/fileHandling';
import { downloadCollectionThumbnail, downloadEmThumbnail } from '@query/thumbnailHandler';
import authService, { hasAccessToAOE } from '@services/authService';
import { verifyEmailToken } from '@services/mailService';
import { aoeRoutes, isAllasEnabled } from '@services/routeEnablerService';
import requestErrorHandler from '@util/requestErrorHandler';
import {
  addCollectionValidationRules,
  createCollectionValidationRules,
  metadataExtensionValidationRules,
  ratingValidationRules,
  removeCollectionValidationRules,
  updateCollectionValidationRules,
  validateRatingUser,
} from '@util/requestValidator';
import { Router } from 'express';

export default (router: Router): void => {
  router.get('/aoeUsers', hasAccessToAOE, getAoeUsers);
  router.post('/changeUser', hasAccessToAOE, changeMaterialUser);

  router.get('/material', db.getMaterial);
  router.post(
    '/material/attachment/:materialId',
    isAllasEnabled,
    authService.checkAuthenticated,
    authService.hasAccessToMaterial,
    fileHandling.uploadAttachmentToMaterial,
  );
  router.post('/material/file', isAllasEnabled, authService.checkAuthenticated, fileHandling.uploadMaterial);
  router.get('/messages/info', aoeRoutes);
  router.get('/metadata/:id', getMetadataExtension);
  router.put(
    '/metadata/:id',
    metadataExtensionValidationRules(),
    requestErrorHandler,
    authService.checkAuthenticated,
    addMetadataExtension,
  );
  router.get('/names/:id', hasAccessToAOE, getMaterialNames);
  router.get('/pdf/content/:key', downloadPdfFromAllas);
  router.get('/recentmaterial', db.getRecentMaterial);

  router.delete('/removeMaterial/:id', hasAccessToAOE, removeEducationalMaterial);

  router.get('/thumbnail/:id', downloadEmThumbnail);
  router.put('/updateSettings', authService.checkAuthenticated, updateUserSettings);
  router.get('/user', authService.checkAuthenticated, db.getUser);
  router.put('/user', authService.checkAuthenticated, db.updateUser);
  router.get('/userdata', authService.checkAuthenticated, authService.getUserData);
  router.post('/userinfo', authService.userInfo);
  router.get('/usermaterial', authService.checkAuthenticated, db.getUserMaterial);
  router.get('/usersMetadata/:id', authService.checkAuthenticated, getUsersMetadataExtension);
  router.put('/termsOfUsage', authService.checkAuthenticated, db.updateTermsOfUsage);
  router.get('/verify', verifyEmailToken);

  // Collection request endpoints
  router.post(
    '/collection/addMaterial',
    authService.checkAuthenticated,
    authService.hasAccessToCollection,
    addCollectionValidationRules(),
    requestErrorHandler,
    collection.addEducationalMaterialToCollection,
  );
  router.post(
    '/collection/create',
    authService.checkAuthenticated,
    createCollectionValidationRules(),
    requestErrorHandler,
    collection.createCollection,
  );
  router.get('/collection/getCollection/:collectionId', collection.getCollection);
  router.post(
    '/collection/removeMaterial',
    authService.checkAuthenticated,
    authService.hasAccessToCollection,
    removeCollectionValidationRules(),
    requestErrorHandler,
    collection.removeEducationalMaterialFromCollection,
  );
  router.get('/collection/recentCollection', collection.getRecentCollection);
  router.put(
    '/collection/update',
    authService.checkAuthenticated,
    authService.hasAccessToCollection,
    updateCollectionValidationRules(),
    requestErrorHandler,
    collection.updateCollection,
  );
  router.get('/collection/userCollection', authService.checkAuthenticated, collection.getUserCollections);
  router.get('/collection/thumbnail/:id', downloadCollectionThumbnail);

  // Rating request endpoints
  router.post(
    '/rating',
    authService.checkAuthenticated,
    ratingValidationRules(),
    requestErrorHandler,
    validateRatingUser,
    rating.addRating,
  );
  router.get('/rating/:materialId', authService.checkAuthenticated, rating.getUserRating);
  router.get('/ratings/:materialId', rating.getRating);
};
