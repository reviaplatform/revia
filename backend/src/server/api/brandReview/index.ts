import { InitRouterFunc } from '@server/types/server';
import router from './brandReview.router';

const initBrandReview: InitRouterFunc = app => {
    // /api/v1/brand-reviews/*
    app.use('/brand-reviews', router);
};

export default initBrandReview;
