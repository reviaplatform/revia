import { InitRouterFunc } from '@server/types/server';
import router from './device.router';

const initDevice: InitRouterFunc = app => {
    // /api/v1/devices/*
    app.use('/devices', router);
};

export default initDevice;
