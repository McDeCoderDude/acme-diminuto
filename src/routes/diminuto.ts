import express, { Request, Response } from 'express';
import shortid from 'shortid';
import DiminutoUrlModel from '../models/DiminutoUrlModel';
import rateLimit from 'express-rate-limit';
import { isSafeHttpUrl } from '../utils/urlValidation';
import { generateUrlCode } from '../utils/urlCode';

const router = express.Router();

const getBaseUrl = () => process.env.DNS_URI || 'http://localhost:3000';

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
});

export async function createDiminuto(req: Request, res: Response) {
    const { longUrl } = req.body;
    const baseUrl = getBaseUrl();

    if (!isSafeHttpUrl(baseUrl)) {
        return res.status(400).json({
            message: 'Invalid base url'
        });
    }

    if (!isSafeHttpUrl(longUrl)) {
        return res.status(400).json({
            message: 'Invalid long Url'
        });
    }

    try {
        const urlCode = generateUrlCode(shortid.generate);
        const existing = await DiminutoUrlModel.findOne({ longUrl: { $eq: longUrl } });
        if (existing) {
            return res.json(existing);
        }

        const shortUrl = `${baseUrl}/${urlCode}`;
        const created = await DiminutoUrlModel.create({
            longUrl,
            shortUrl,
            urlCode
        });
        return res.json(created);
    } catch (err){
        console.log(err);
        return res.status(500).json({
            message: 'Server error'
        });
    }
}

router.post('/api/diminuto', limiter, createDiminuto);

export { router as diminutoRouter };
