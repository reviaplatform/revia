import { InitRouterFunc } from '@server/types/server';
import router from './payout.router';

const initPayout: InitRouterFunc = app => {
    // /api/v1/provider/payouts/*
    app.use('/payouts', router);
};

export default initPayout;
