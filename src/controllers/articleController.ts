import { Request, Response } from 'express'
import fs from 'fs'
import { v4 as uuidv4 } from 'uuid'
import { Article } from '../models/articleModel'
import cloudinary from '../utils/cloudinary'

export const createArticle = async (req: Request | any, res: Response) => {
    try {
        const { articleTitle, articleBody, headerImage } = req.body

        const id = uuidv4()

        if (!headerImage) {
            return res.status(400).json({ message: 'Image file is required' })
        }

        const result = await cloudinary.uploader.upload(headerImage, {})

        const article = await Article.create({
            articleId: id,
            articleTitle,
            headerImage: result.secure_url,
            articleBody,
            cloudinary_id: result.public_id,
        })

        return res
            .status(201)
            .json({ message: 'Article created successfully', article, result })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ Error: 'Internal server error' })
    }
}

export const updateArticle = async (req: Request | any, res: Response) => {
    try {
        const { id } = req.params

        const { articleTitle, articleBody } = req.body

        const updateArticle = await Article.findOne({
            where: { articleId: id },
        })

        if (!updateArticle) {
            return res.status(404).json({ Error: 'Article not found' })
        }

        const headerImage = req.body?.headerImage

        const updateImage = await cloudinary.uploader.upload(headerImage, {})

        updateArticle.articleTitle = articleTitle
        updateArticle.headerImage = updateImage.secure_url
        updateArticle.articleBody = articleBody
        updateArticle.cloudinary_id = updateImage.public_id

        const newArticle = await updateArticle.save()

        return res.status(200).json({
            msg: `Article "${newArticle.articleTitle}" updated`,
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ Error: 'Internal server error' })
    }
}

export const getArticle = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const getArticle = await Article.findOne({
            where: { articleId: id },
        })

        if (!getArticle) {
            return res.status(400).json({ Error: "Article doesn't exist" })
        }

        return res.status(200).json({
            getArticle,
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ Error: 'Internal server error' })
    }
}
export const getAllArticles = async (req: Request, res: Response) => {
    try {
        const allArticles = await Article.findAll()

        if (!allArticles) {
            return res.status(400).json({ Error: 'There are no articles' })
        }

        return res.status(200).json({
            allArticles,
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ Error: 'Internal server error' })
    }
}

export const deleteArticle = async (req: Request, res: Response) => {
    try {
        const { id } = req.params

        const newArticle = await Article.findOne({
            where: { articleId: id },
        })

        if (!newArticle) {
            return res.status(400).json({
                Error: 'Article not found',
            })
        }

        const deleteArticle = await Article.destroy({
            where: {
                articleId: id,
            },
        })
        console.log(deleteArticle)
        return res.status(200).json({
            message: `Article "${newArticle.articleTitle}" deleted`,
        })
    } catch (error) {
        console.log(error)
        res.status(500).send('An error occurred while deleting the article')
    }
}
