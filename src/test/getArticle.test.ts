import { getArticle } from '../controllers/articleController'
import { Article } from '../models/articleModel'

describe('getArticle', () => {
    test('should return the article when it exists', async () => {
        // Create a mock Request and Response objects
        const req: any = { params: { id: 'articleId' } }
        const res: any = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        }

        // Mock the Article.findOne function to return a dummy article
        const dummyArticle: any = {
            articleId: 'articleId',
            title: 'Dummy Article',
        }
        jest.spyOn(Article, 'findOne').mockResolvedValueOnce(dummyArticle)

        // Call the getArticle function
        await getArticle(req, res)

        // Assertions
        expect(res.status).toHaveBeenCalledWith(200)
        expect(res.json).toHaveBeenCalledWith({ getArticle: dummyArticle })
    })

    test('should return an error when the article does not exist', async () => {
        // Create a mock Request and Response objects
        const req: any = { params: { id: 'nonExistentId' } }
        const res: any = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        }

        // Mock the Article.findOne function to return null
        jest.spyOn(Article, 'findOne').mockResolvedValue(null)

        // Call the getArticle function
        await getArticle(req, res)

        // Assertions
        expect(res.status).toHaveBeenCalledWith(400)
        expect(res.json).toHaveBeenCalledWith({
            Error: "Article doesn't exist",
        })
    })

    test('should return an error on internal server error', async () => {
        // Create a mock Request and Response objects
        const req: any = { params: { id: 'articleId' } }
        const res: any = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        }

        // Mock the Article.findOne function to throw an error
        jest.spyOn(Article, 'findOne').mockRejectedValue(
            new Error('Database error')
        )

        // Call the getArticle function
        await getArticle(req, res)

        // Assertions
        expect(res.status).toHaveBeenCalledWith(500)
        expect(res.json).toHaveBeenCalledWith({
            Error: 'Internal server error',
        })
    })
})
