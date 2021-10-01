import { Router, Response, Request } from 'express';

const router: Router = Router();

// Root status page with pug template
router.get('/', (req: Request, res: Response) => {
    res.render('index', { appTitle: 'AOE Streaming', appStatus: 'running' });
})

export default router;
