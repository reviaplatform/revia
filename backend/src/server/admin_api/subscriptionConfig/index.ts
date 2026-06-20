import { InitRouterFunc } from '@server/types/server';
import router from './subscriptionConfig.router';

const initAdminSubscriptionConfig: InitRouterFunc = app => {
  app.use('/subscription-config', router);
};

export default initAdminSubscriptionConfig;
