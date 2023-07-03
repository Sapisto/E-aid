import { Buffer } from 'buffer'
import { UploadApiResponse } from 'cloudinary'
import { Request, Response } from 'express'
import fileUpload, { UploadedFile } from 'express-fileupload'
import { createArticle } from '../controllers/articleController'
import { Article } from '../models/articleModel'
import cloudinary from '../utils/cloudinary'
import path from "path"

import fs from 'fs'

jest.mock('../models/auth.model')
jest.mock('../utils/cloudinary')
jest.mock('../models/articleModel', () => {
    return {
        Article: {
            create: jest.fn(),
        },
    }
})

describe('Should Create Article', () => {
    let req: Request
    let res: Response

    beforeEach(() => {
        req = {
            body: {
                articleTitle: 'Test Article',
                articleBody: 'This is a test article',
            },
            files: {},
        } as Request

        res = {
            status: jest.fn(() => res),
            json: jest.fn(),
        } as unknown as Response
    })

    it('should return a 400 status code if headerImage is missing', async () => {
        await createArticle(req, res)

        expect(res.status).toHaveBeenCalledWith(400)
        expect(res.json).toHaveBeenCalledWith({
            message: 'Image file is required',
        })
    })

    it('should upload headerImage and create an article when all required fields are provided', async () => {
        const mockHeaderImage: UploadedFile = {
            tempFilePath: path.resolve(__dirname, 'test-images/profile.jpeg'),
            name: 'profile.jpeg',
            mv: jest.fn(),
            encoding: 'utf-8',
            mimetype: 'image/jpeg',
            size: 12345,
            data: Buffer.from(''),
            truncated: false,
            md5: '',
        }

        const mockFileArray: fileUpload.FileArray = {
            image: mockHeaderImage,
        }

        req.files = mockFileArray

        const cloudinaryUploadResult: UploadApiResponse = {
            secure_url: 'https://example.com/image.jpg',
            public_id: 'abc123',
            version: 123,
            signature: 'xyz456',
            width: 800,
            height: 600,
            format: '',
            resource_type: 'raw',
            created_at: '',
            tags: [],
            pages: 0,
            bytes: 0,
            type: '',
            etag: '',
            placeholder: false,
            url: '',
            access_mode: '',
            original_filename: '',
            moderation: [],
            access_control: [],
            context: {},
            metadata: {},
        }

        jest.spyOn(cloudinary.uploader, 'upload').mockResolvedValue(
            cloudinaryUploadResult
        )

        const createdArticle = {
            articleId: '123',
            articleTitle: 'Test Article',
            headerImage: cloudinaryUploadResult.secure_url,
            articleBody: 'This is a test article',
            cloudinary_id: cloudinaryUploadResult.public_id,
        }

        jest.spyOn(Article, 'create').mockResolvedValue(createdArticle)

        // eslint-disable-next-line @typescript-eslint/no-empty-function
        const unlinkSpy = jest
            .spyOn(fs, 'unlinkSync')
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            .mockImplementation(() => {})

        await createArticle(req, res)

        expect(cloudinary.uploader.upload).toHaveBeenCalledWith(
            mockHeaderImage.tempFilePath,
            {
                folder: 'article-Images',
                use_filename: true,
                allowed_formats: ['jpg', 'jpeg', 'png'],
                chunk_size: 50000,
            }
        )
        expect(Article.create).toHaveBeenCalledWith({
            articleId: expect.any(String),
            articleTitle: req.body.articleTitle,
            headerImage: cloudinaryUploadResult.secure_url,
            articleBody: req.body.articleBody,
            cloudinary_id: cloudinaryUploadResult.public_id,
        })
        expect(unlinkSpy).toHaveBeenCalledWith(mockHeaderImage.tempFilePath)
        expect(res.status).toHaveBeenCalledWith(201)
        expect(res.json).toHaveBeenCalledWith({
            message: 'Article created successfully',
            article: createdArticle,
            result: cloudinaryUploadResult,
        })
    })

    it('should return a 400 status code and error message when an invalid file format is uploaded', async () => {
        const mockHeaderImage: UploadedFile = {
            tempFilePath:path.resolve(__dirname, 'test-images/profile.jpeg'),
            name: 'profile.gif',
            mv: jest.fn(),
            encoding: 'utf-8',
            mimetype: 'image/gif',
            size: 12345,
            data: Buffer.from(''),
            truncated: false,
            md5: '',
        }

        const mockFileArray: fileUpload.FileArray = {
            image: mockHeaderImage,
        }

        req.files = mockFileArray

        await createArticle(req, res)

        expect(res.status).toHaveBeenCalledWith(400)
        expect(res.json).toHaveBeenCalledWith({
            message:
                'Invalid file format. Only JPG, JPEG, and PNG formats are allowed.',
        })
    })

    it('should upload headerImage and create an article when the article body is not provided', async () => {
        delete req.body.articleBody

        const mockHeaderImage: UploadedFile = {
            tempFilePath: path.resolve(__dirname, 'test-images/profile.jpeg'),
            name: 'profile.jpeg',
            mv: jest.fn(),
            encoding: 'utf-8',
            mimetype: 'image/jpeg',
            size: 12345,
            data: Buffer.from(''),
            truncated: false,
            md5: '',
        }

        const mockFileArray: fileUpload.FileArray = {
            image: mockHeaderImage,
        }

        req.files = mockFileArray

        const cloudinaryUploadResult: UploadApiResponse = {
            secure_url: 'https://example.com/image.jpg',
            public_id: 'abc123',
            version: 123,
            signature: 'xyz456',
            width: 800,
            height: 600,
            format: '',
            resource_type: 'raw',
            created_at: '',
            tags: [],
            pages: 0,
            bytes: 0,
            type: '',
            etag: '',
            placeholder: false,
            url: '',
            access_mode: '',
            original_filename: '',
            moderation: [],
            access_control: [],
            context: {},
            metadata: {},
        }

        jest.spyOn(cloudinary.uploader, 'upload').mockResolvedValue(
            cloudinaryUploadResult
        )

        const createdArticle = {
            articleId: '123',
            articleTitle: 'Test Article',
            headerImage: cloudinaryUploadResult.secure_url,
            articleBody: undefined,
            cloudinary_id: cloudinaryUploadResult.public_id,
        }

        jest.spyOn(Article, 'create').mockResolvedValue(createdArticle)

        // eslint-disable-next-line @typescript-eslint/no-empty-function
        const unlinkSpy = jest
            .spyOn(fs, 'unlinkSync')
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            .mockImplementation(() => {})

        await createArticle(req, res)

        expect(cloudinary.uploader.upload).toHaveBeenCalledWith(
            mockHeaderImage.tempFilePath,
            {
                folder: 'article-Images',
                use_filename: true,
                allowed_formats: ['jpg', 'jpeg', 'png'],
                chunk_size: 50000,
            }
        )
        expect(Article.create).toHaveBeenCalledWith({
            articleId: expect.any(String),
            articleTitle: req.body.articleTitle,
            headerImage: cloudinaryUploadResult.secure_url,
            articleBody: req.body.articleBody, // Will be undefined
            cloudinary_id: cloudinaryUploadResult.public_id,
        })
        expect(unlinkSpy).toHaveBeenCalledWith(mockHeaderImage.tempFilePath)
        expect(res.status).toHaveBeenCalledWith(201)
        expect(res.json).toHaveBeenCalledWith({
            message: 'Article created successfully',
            article: createdArticle,
            result: cloudinaryUploadResult,
        })
    })

    it('should return a 500 status code and error message when encountering an error during file upload', async () => {
        jest.spyOn(cloudinary.uploader, 'upload').mockRejectedValueOnce(
            new Error('Upload error')
        )

        const mockHeaderImage: UploadedFile = {
            tempFilePath: path.resolve(__dirname, 'test-images/profile.jpeg'),
            name: 'profile.jpeg',
            mv: jest.fn(),
            encoding: 'utf-8',
            mimetype: 'image/jpeg',
            size: 12345,
            data: Buffer.from(''),
            truncated: false,
            md5: '',
        }

        const mockFileArray: fileUpload.FileArray = {
            image: mockHeaderImage,
        }

        req.files = mockFileArray

        await createArticle(req, res)

        expect(res.status).toHaveBeenCalledWith(500)
        expect(res.json).toHaveBeenCalledWith({
            Error: 'Internal server error',
        })
    })
})
