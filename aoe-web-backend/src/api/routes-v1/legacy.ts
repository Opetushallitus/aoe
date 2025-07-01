import {
  addEducationalMaterialToCollection,
  createCollection,
  getCollection,
  getRecentCollection,
  getUserCollections,
  removeEducationalMaterialFromCollection,
  updateCollection,
} from '@/collection/collection';
import { changeMaterialUser, getAoeUsers, getMaterialNames, removeEducationalMaterial } from '@/controllers/material';
import { downloadPdfFromAllas } from '@/helpers/officeToPdfConverter';
import {
  addMetadataExtension,
  getMetadataExtension,
  getUsersMetadataExtension,
} from '@/metadataExtension/metadataExtension';
import { addRating, getRating, getUserRating } from '@/rating/rating';
import { getUserData, hasAccessToCollection, userInfo } from '@/services/authService';
import { updateUserSettings } from '@/users/userSettings';
import {
  getMaterial,
  getRecentMaterial,
  getUser,
  getUserMaterial,
  updateTermsOfUsage,
  updateUser,
} from '@query/apiQueries';
import { uploadAttachmentToMaterial, uploadMaterial } from '@query/fileHandling';
import { downloadCollectionThumbnail, downloadEmThumbnail } from '@query/thumbnailHandler';
import { checkAuthenticated, hasAccessToAOE, hasAccessToMaterial } from '@services/authService';
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

  router.get('/material', getMaterial);
  router.post(
    '/material/attachment/:materialId',
    isAllasEnabled,
    checkAuthenticated,
    hasAccessToMaterial,
    uploadAttachmentToMaterial,
  );
  router.post('/material/file', isAllasEnabled, checkAuthenticated, uploadMaterial);
  router.get('/messages/info', aoeRoutes);
  router.get('/metadata/:id', getMetadataExtension);
  router.put(
    '/metadata/:id',
    metadataExtensionValidationRules(),
    requestErrorHandler,
    checkAuthenticated,
    addMetadataExtension,
  );
  router.get('/names/:id', hasAccessToAOE, getMaterialNames);
  router.get('/pdf/content/:key', downloadPdfFromAllas);
  router.get('/recentmaterial', getRecentMaterial);

  router.delete('/removeMaterial/:id', hasAccessToAOE, removeEducationalMaterial);

  router.get('/thumbnail/:id', downloadEmThumbnail);
  router.put('/updateSettings', checkAuthenticated, updateUserSettings);
  router.get('/user', checkAuthenticated, getUser);
  router.put('/user', checkAuthenticated, updateUser);
  router.get('/userdata', checkAuthenticated, getUserData);
  router.post('/userinfo', userInfo);
  router.get('/usermaterial', checkAuthenticated, getUserMaterial);
  router.get('/usersMetadata/:id', checkAuthenticated, getUsersMetadataExtension);
  router.put('/termsOfUsage', checkAuthenticated, updateTermsOfUsage);
  router.get('/verify', verifyEmailToken);

  // Collection request endpoints
  router.post(
    '/collection/addMaterial',
    checkAuthenticated,
    hasAccessToCollection,
    addCollectionValidationRules(),
    requestErrorHandler,
    addEducationalMaterialToCollection,
  );
  router.post(
    '/collection/create',
    checkAuthenticated,
    createCollectionValidationRules(),
    requestErrorHandler,
    createCollection,
  );
  router.get('/collection/getCollection/:collectionId', getCollection);
  router.post(
    '/collection/removeMaterial',
    checkAuthenticated,
    hasAccessToCollection,
    removeCollectionValidationRules(),
    requestErrorHandler,
    removeEducationalMaterialFromCollection,
  );
  router.get('/collection/recentCollection', getRecentCollection);
  router.put(
    '/collection/update',
    checkAuthenticated,
    hasAccessToCollection,
    updateCollectionValidationRules(),
    requestErrorHandler,
    updateCollection,
  );
  router.get('/collection/userCollection', checkAuthenticated, getUserCollections);
  router.get('/collection/thumbnail/:id', downloadCollectionThumbnail);

  // Rating request endpoints
  router.post(
    '/rating',
    checkAuthenticated,
    ratingValidationRules(),
    requestErrorHandler,
    validateRatingUser,
    addRating,
  );
  router.get('/rating/:materialId', checkAuthenticated, getUserRating);
  router.get('/ratings/:materialId', getRating);
};
