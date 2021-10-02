import { Router, Response, Request } from 'express';

const routerRootModule: Router = Router();

// Root status page with Pug template
routerRootModule.get('/', (req: Request, res: Response) => {
    res.render('index', {appTitle: 'AOE Streaming', appStatus: 'up and running'});
})

export default routerRootModule;
