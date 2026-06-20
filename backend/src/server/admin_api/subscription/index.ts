import { InitRouterFunc } from '@server/types/server';
import router from './subscription.router';

const initAdminSubscription: InitRouterFunc = app => {
  app.use('/subscriptions', router);
};

export default initAdminSubscription;
