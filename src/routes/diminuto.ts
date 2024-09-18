import express, { Request, Response } from 'express';
import validUrl from 'valid-url';
import shortid from 'shortid';
import DiminutoUrlModel from '../models/DiminutoUrlModel';
import rateLimit from 'express-rate-limit';

const router = express.Router();

const baseUrl = process.env.DNS_URI || 'http://localhost:3000';

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
});

router.post('/api/diminuto', limiter, async(req: Request, res: Response) => {
   const {longUrl: longUrl} = req.body;
   if(!validUrl.isUri(baseUrl)) {
       return res.status(401).json({
           message: 'Invalid base url'
       });
   }
   const urlCode = shortid.generate();

   if(validUrl.isUri(longUrl)) {
       try {
           let url = await DiminutoUrlModel.findOne({longUrl: { $eq: longUrl }});
           if(url) {
               res.json(url)
           } else {
               const shortUrl = baseUrl + '/' + urlCode;
               url = new DiminutoUrlModel({
                   longUrl: longUrl,
                   shortUrl: shortUrl,
                   urlCode: urlCode,
                   createdAt: new Date(),
                   updatedAt: new Date()
               });
               await url.save();
               res.json(url);
           }
       } catch (err){
           console.log(err);
           res.status(500).json({
               message: 'Server error'
           });
       }
   } else {
       res.status(401).json({
           message: 'Invalid long Url'
       });
   }
});

export { router as diminutoRouter };
