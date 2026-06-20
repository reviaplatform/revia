
import { InitRouterFunc } from '@server/types/server';
import router from './auth.router';

const initAuth: InitRouterFunc = app => {
  // /api/v1/provider/auth/*
  app.use('/auth', router);
};

export default initAuth;
