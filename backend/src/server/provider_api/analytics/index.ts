import { InitRouterFunc } from '@server/types/server';
import router from './analytics.router';

const initAnalytics: InitRouterFunc = app => {
    // /api/v1/provider/analytics/*
    app.use('/analytics', router);
};

export default initAnalytics;
