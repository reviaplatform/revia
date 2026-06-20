import { InitRouterFunc } from '@server/types/server';
import router from './brandChat.router';

const initBrandChat: InitRouterFunc = app => {
  app.use('/brand-chat', router);
};

export default initBrandChat;
