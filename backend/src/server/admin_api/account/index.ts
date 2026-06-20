import { InitRouterFunc } from '@server/types/server';
import router from './account.router';

const initAccount: InitRouterFunc = app => {
  //  /api/v1/admin/account/*
  app.use('/account', router);
};

export default initAccount;
