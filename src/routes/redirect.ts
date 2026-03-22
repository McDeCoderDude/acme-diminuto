import express, {Request, Response} from 'express';
import DiminutoUrlModel from '../models/DiminutoUrlModel';
import rateLimit from 'express-rate-limit';
import { isSafeShortCode } from '../utils/urlValidation';

const router = express.Router();

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
});

router.get('/:code', limiter, async (req: Request, res: Response) => {
    const code = Array.isArray(req.params.code) ? req.params.code[0] : req.params.code;

    if (!isSafeShortCode(code)) {
        return res.status(400).send('Invalid short code');
    }

    try {
        const url = await DiminutoUrlModel.findOne({
            urlCode: code
        });
        if(url) {
            return res.redirect(url.longUrl);
        } else {
            return res.status(404).send('URL not found');
        }
    } catch (err) {
       console.error(err);
       res.status(500).send('Internal Server Error');
    }
});

export { router as redirectRouter };
