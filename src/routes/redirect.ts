import express, {Request, Response} from 'express';
import DiminutoUrlModel from '../models/diminutoUrlModel';


const router = express.Router();


router.get('/:code', async (req: Request, res: Response) => {
    try {
        const url = await DiminutoUrlModel.findOne({
            urlCode: req.params.code
        });
        if(url) {
            return res.redirect(url.originalUrl);
        } else {
            return res.status(404).send('URL not found');
        }
    } catch (err) {
       console.error(err);
       res.status(500).send('Internal Server Error');
    }
});

export { router as redirectRouter };
