
import supertest from 'supertest'
import { Request, Response } from 'express'
import app from '../app'
import { User } from '../models/auth.model'
import { register } from '../controllers/auth.controller'


jest.mock('./models/auth.model', () => ({
    User: {
        findOne: jest.fn(),
    },
}))
  

describe('POST /auth/register', () => { 

    afterEach(() => {
        jest.clearAllMocks()
    })



    test('should respond with a 200 status code', async () => {
        const response = await supertest(app).post('/auth/register').send({
            email: 'tzirw@example.com',
            fullName: 'test',
            phone: '0123456789',
            password: 'test',
            role: 'user',
        })
        expect(response.statusCode).toBe(200)
    })
    test('should specify json in the content type header', async () => {
        const response = await supertest(app).post('/auth/register').send({
            email: 'tzirw@example.com',
            fullName: 'test',
            phone: '0123456789',
            password: 'test',
            role: 'user',
        })
        expect(response.headers['content-type']).toEqual(
            expect.stringContaining('json')
        )
    })


    test('should return 400 status code if user with the same email already exists', async () => {

        //const mockUser = null
        const req: Request = {
            body: {
                email: 'test@example.com',
                fullName: 'John Doe',
                phone: '1234567890',
                password: 'password',
                role: 'user',
            },
        } as Request
        const res: Response = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        } as unknown as Response

        (User.findOne as jest.Mock).mockResolvedValueOnce({})

        await register(req, res)

        expect(User.findOne).toHaveBeenCalledWith({
            where: { email: req.body.email },
        })
        expect(res.status).toHaveBeenCalledWith(400)
        expect(res.json).toHaveBeenCalledWith({
            message: 'User with this email already exists',
        })
    })


    test('should return 500 status code for internal server error', async () => {
        const req: Request = {
            body: {
                email: 'test@example.com',
                fullName: 'John Doe',
                phone: '1234567890',
                password: 'password',
                role: 'user',
            },
        } as Request
        const res: Response = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        } as unknown as Response

        (User.findOne as jest.Mock).mockRejectedValueOnce(
            new Error('Database error')
        )

        await register(req, res)

        expect(User.findOne).toHaveBeenCalledWith({
            where: { email: req.body.email },
        })
        expect(res.status).toHaveBeenCalledWith(500)
        expect(res.json).toHaveBeenCalledWith({
            message: 'Internal server error',
        })
    })


     test('should make a successful POST request to /auth/register', async () => {
         const response = await supertest(app).post('/auth/register').send({
             email: 'test@example.com',
             fullName: 'John Doe',
             phone: '1234567890',
             password: 'password',
             role: 'user',
         })

         expect(response.status).toBe(200)
         expect(response.body).toEqual({
             message: 'Name must be 3 or more character',
            
         })
     })

})



 

 
