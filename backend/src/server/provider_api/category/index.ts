import { InitRouterFunc } from '@server/types/server';
import router from './category.router';

const initCategory: InitRouterFunc = app => {
  //  /api/v1/provider/category/*
  app.use('/category', router);
};

export default initCategory;
