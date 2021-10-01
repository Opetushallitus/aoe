import { Router, Response, Request } from 'express';

const router: Router = Router();

router.get('/', (req: Request, res: Response) => {
    res.render('index', { title: 'AOE Streaming', message: 'Streaming service up and running' });
})

export default router;
