import { InitRouterFunc } from '@server/types/server';
import router from './support.router';

const initSupport: InitRouterFunc = app => {
    app.use('/support', router);
};

export default initSupport;
