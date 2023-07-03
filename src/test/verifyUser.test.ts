import { Request, Response } from 'express'
import { verifyUserOtp } from '../controllers/auth.controller'
import { User } from '../models/auth.model'

jest.mock('../models/auth.model')

describe('verifyUserOtp', () => {
    let req: Request
    let res: Response

    beforeEach(() => {
        req = {
            body: {
                otp: '123456',
            },
        } as Request

        res = {
            status: jest.fn(() => res),
            json: jest.fn(),
        } as unknown as Response
    })

    it('should return success response if OTP is valid', async () => {
        const userMock = {
            otp: '123456',
            status: '',
            save: jest.fn(),
        }

        ;(User.findOne as jest.Mock).mockResolvedValue(userMock)

        await verifyUserOtp(req, res)

        expect(User.findOne).toHaveBeenCalledWith({ where: { otp: '123456' } })
        expect(userMock.status).toBe('verified')
        expect(userMock.save).toHaveBeenCalled()
        expect(res.status).toHaveBeenCalledWith(200)
        expect(res.json).toHaveBeenCalledWith({
            message: 'OTP verified successfully',
        })
    })

    it('should return error response if OTP is invalid', async () => {
        ;(User.findOne as jest.Mock).mockResolvedValue(null)

        await verifyUserOtp(req, res)

        expect(User.findOne).toHaveBeenCalledWith({ where: { otp: '123456' } })
        expect(res.status).toHaveBeenCalledWith(403)
        expect(res.json).toHaveBeenCalledWith({ error: 'Please recheck OTP' })
    })

    it('should return error response if user is not found', async () => {
        const userMock = null

        ;(User.findOne as jest.Mock).mockResolvedValue(userMock)

        await verifyUserOtp(req, res)

        expect(User.findOne).toHaveBeenCalledWith({ where: { otp: '123456' } })
        expect(res.status).toHaveBeenCalledWith(403)
        expect(res.json).toHaveBeenCalledWith({ error: 'Please recheck OTP' })
    })

    it('should handle internal server error', async () => {
        ;(User.findOne as jest.Mock).mockRejectedValue(
            new Error('Database error')
        )

        await verifyUserOtp(req, res)

        expect(User.findOne).toHaveBeenCalledWith({ where: { otp: '123456' } })
        expect(res.status).toHaveBeenCalledWith(500)
        expect(res.json).toHaveBeenCalledWith({
            error: 'Internal server error',
        })
    })
})


