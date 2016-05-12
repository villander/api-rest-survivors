import { Router } from 'express';
import controller from './controller';

const router = Router(); // eslint-disable-line

router.get('/', controller.getAllSurvivors);
router.get('/:id', controller.getSurvivorById);
router.put('/:id', controller.updateSurvivor);
router.post('/', controller.createSurvivor);
router.put('/trade/items', controller.marketsItemsBetweenSurvivors);
router.put('/:id/report/:infected_id', controller.markedAsInfected);
router.get('/reports/survivors?', controller.getReportSurvivors);
router.get('/reports/survivors/pointslost', controller.getPointsLost);

export default router;
