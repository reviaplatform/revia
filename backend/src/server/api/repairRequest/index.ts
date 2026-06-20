import { InitRouterFunc } from '@server/types/server';
import router from './repairRequest.router';

const initRepairRequest: InitRouterFunc = app => {
    // /api/v1/repair-requests/*
    app.use('/repair-requests', router);
};

export default initRepairRequest;
