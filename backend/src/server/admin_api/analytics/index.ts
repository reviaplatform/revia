import { InitRouterFunc } from '@server/types/server';
import router from './analytics.router';

const initAdminAnalytics: InitRouterFunc = app => {
    // /api/v1/admin/analytics/*
    app.use('/analytics', router);
};

export default initAdminAnalytics;
