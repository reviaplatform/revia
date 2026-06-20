import { Router } from 'express';
import { InitRouterFunc } from '@server/types/server';
import initCategory from './category';
import initAuth from './auth';
import initAccount from './account';
import initUser from './user';
import initBrand from './brand';
import initBranch from './branch';
import initRepairRequest from './repairRequest';
import initPayout from './payout';
import initReel from './reel';
import initSupport from './support';
import initSubscription from './subscription';
import initBrandChat from './brandChat';
import initAnalytics from './analytics';

const initProviderApi: InitRouterFunc = app => {
  const router = Router();
  initAuth(router);
  initUser(router);
  initCategory(router);
  initAccount(router);
  initBrand(router);
  initBranch(router);
  initRepairRequest(router);
  initPayout(router);
  initReel(router);
  initSupport(router);
  initSubscription(router);
  initBrandChat(router);
  initAnalytics(router);
  app.use('/api/v1/provider', router);
};

export default initProviderApi;
