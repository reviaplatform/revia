import { Router } from 'express';
import { InitRouterFunc } from '@server/types/server';
import initAuth from './auth';
import initAccount from './account';
import initUser from './user';
import initCategory from './category';
import initBrand from './brand';
import initRepairRequest from './repairRequest';
import initPayout from './payout';
import initSupport from './support';
import initAdminSubscription from './subscription';
import initAdminSubscriptionConfig from './subscriptionConfig';
import initAdminAnalytics from './analytics';

const initAdminApi: InitRouterFunc = app => {
  const router = Router();
  initUser(router);
  initAuth(router);
  initAccount(router);
  initCategory(router);
  initBrand(router);
  initRepairRequest(router);
  initPayout(router);
  initSupport(router);
  initAdminSubscription(router);
  initAdminSubscriptionConfig(router);
  initAdminAnalytics(router);
  app.use('/api/v1/admin', router);
};

export default initAdminApi;
