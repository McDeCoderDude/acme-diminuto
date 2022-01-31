import express, { Request, Response } from 'express';
import validUrl from 'valid-url';
import shortid from 'shortid';
import DiminutoUrlModel from '../models/DiminutoUrlModel';

const router = express.Router();

const baseUrl = process.env.DNS_URI || 'http://localhost:3000';

router.post('/api/diminuto', async(req: Request, res: Response) => {
   const {longUrl: longUrl} = req.body;
   if(!validUrl.isUri(baseUrl)) {
       return res.status(401).json({
           message: 'Invalid base url'
       });
   }
   const urlCode = shortid.generate();

   if(validUrl.isUri(longUrl)) {
       try {
           let url = await DiminutoUrlModel.findOne({longUrl: longUrl});
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
