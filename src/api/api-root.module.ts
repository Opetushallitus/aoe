import { Router, Response, Request } from 'express';

const apiRouterRoot = Router();

// Root status page with Pug template
apiRouterRoot.get('/', (req: Request, res: Response) => {
    res.render('index', {appTitle: 'AOE Streaming', appStatus: 'operable'});
})

export default apiRouterRoot;
