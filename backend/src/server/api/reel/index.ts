import { Router } from 'express';
import reelRouter from './reel.router';

export default function initReel(router: Router) {
  router.use('/reel', reelRouter);
}
