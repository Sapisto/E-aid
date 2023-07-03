import express, { Request, Response, NextFunction } from 'express'
import cloudinary from '../utils/cloudinary'
import path from 'path'
import { Article} from '../models/articleModel'



export const imageUpload = async (
    req: Request|any,
    res: Response,
    Next: NextFunction
) => {
    try {
        
        const headerImage = req.files?.image
        

        const result = await cloudinary.uploader.upload(
            headerImage.tempFilePath,
            {
                folder: 'article-Images',
                use_filename: true,
                // allowed_formats: ['jpg', 'jpeg', 'png'],
                // chunk_size: 500000,
            }
        )

        return res.status(200).json({ message: 'image uploaded', result })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ Error: 'Internal server error' })
    }
}