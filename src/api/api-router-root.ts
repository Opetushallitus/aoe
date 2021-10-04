import { Router, Response, Request } from 'express';

const apiRouterRoot = Router();

/**
 * API root status page
 */
apiRouterRoot.get('/', (req: Request, res: Response) => {
    res.render('index', {appTitle: 'AOE Streaming', appStatus: true});
})

export default apiRouterRoot;
