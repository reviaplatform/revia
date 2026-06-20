import { InitRouterFunc } from '@server/types/server';
import router from './branch.router';

const initBranch: InitRouterFunc = app => {
  // /api/v1/provider/branch/*
  app.use('/branch', router);
};

export default initBranch;
