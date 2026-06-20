import { InitRouterFunc } from '@server/types/server';
import router from './subscription.router';

const initSubscription: InitRouterFunc = app => {
  app.use('/subscription', router);
};

export default initSubscription;
