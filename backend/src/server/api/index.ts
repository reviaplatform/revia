import { Router } from 'express';
import initAuth from './auth';
import { InitRouterFunc } from '@server/types/server';
import initUser from './user';
import initCategory from './category';
import initDevice from './device';
import initRepairRequest from './repairRequest';
import initBrandReview from './brandReview';
import initReel from './reel';
import initSupport from './support';

const initApi: InitRouterFunc = app => {
  const router = Router();
  initAuth(router);
  initUser(router);
  initCategory(router);
  initDevice(router);
  initRepairRequest(router);
  initBrandReview(router);
  initReel(router);
  initSupport(router);
  app.use('/api/v1', router);
};

export default initApi;
