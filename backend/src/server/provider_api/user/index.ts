import { InitRouterFunc } from '@server/types/server';
import router from './user.router';

const initUser: InitRouterFunc = app => {
  // /api/v1/provider/*
  app.use('/', router);
};

export default initUser;
