import { InitRouterFunc } from '@server/types/server';
import router from './brand.router';

const initBrand: InitRouterFunc = app => {
  // /api/v1/provider/brand/*
  app.use('/brand', router);
};

export default initBrand;
