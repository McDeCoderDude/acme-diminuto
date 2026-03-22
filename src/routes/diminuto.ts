import express, { Request, Response } from 'express';
import shortid from 'shortid';
import DiminutoUrlModel from '../models/DiminutoUrlModel';
import rateLimit from 'express-rate-limit';
import { isSafeHttpUrl } from '../utils/urlValidation';

const router = express.Router();

const getBaseUrl = () => process.env.DNS_URI || 'http://localhost:3000';

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
});

router.post('/api/diminuto', limiter, async(req: Request, res: Response) => {
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

   const urlCode = shortid.generate();

   try {
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
});

export { router as diminutoRouter };
