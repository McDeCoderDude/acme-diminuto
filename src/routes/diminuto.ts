import express, { Request, Response } from 'express';
import validUrl from 'valid-url';
import shortid from 'shortid';
import DiminutoUrlModel from '../models/diminutoUrlModel';

const router = express.Router();

const baseUrl = 'http://localhost:5000';

router.post('/api/diminuto', async(req: Request, res: Response) => {
   const {originalUrl: originalUrl} = req.body;
   if(!validUrl.isUri(baseUrl)) {
       return res.status(401).json({
           message: 'Invalid base url'
       });
   }
   const urlCode = shortid.generate();

   if(validUrl.isUri(originalUrl)) {
       try {
           let url = await DiminutoUrlModel.findOne({originalUrl: originalUrl});
           if(url) {
               res.json(url)
           } else {
               const shortUrl = baseUrl + '/' + urlCode;
               url = new DiminutoUrlModel({
                   originalUrl: originalUrl,
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
           message: 'Invalid original url'
       });
   }
});


export { router as diminutoRouter };
