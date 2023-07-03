/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express'
import { User } from '../models/auth.model'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import {
    generatePasswordResetOtp,
    generatePasswordResetToken,
    sendPasswordResetOTP,
    validatePasswordResetToken,
} from '../utils/resetpassword'

export const genOtp = async (req: Request, res: Response) => {
    const { email } = req.body

    try {
        let user = await User.findOne({ where: { email } })
        if (!user) {
            return res.status(404).json({
                message: 'User not found, kindly register first',
            })
        }

        const { otp, expiry } = await generatePasswordResetOtp()
        const token = await generatePasswordResetToken(email, res)
        await sendPasswordResetOTP(email, otp)

        user = await user.update({ otp, expiry })

        return res.status(200).json({ message: 'OTP sent successfully', token })
    } catch (error) {
        console.error(error)
        return res.status(500).json({ error: 'Internal server error' })
    }
}

export const verifyOtp = async (req: Request, res: Response) => {
    try {
        const otp = req.body.otp
        const token = req.body.cookie
        console.log(otp, token)

        if (!token) {
            return res.status(400).json({ error: 'Token not found' })
        }

        const isValidToken = validatePasswordResetToken(token)
        if (!isValidToken) {
            return res.status(400).json({ error: 'Invalid or expired token' })
        }

        const decodedToken = jwt.decode(token)

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const email = decodedToken

        const user = await User.findOne({ where: { otp } })
        if (!user) {
            return res.status(404).json({ error: 'User not found' })
        }

        if (otp !== user.otp) {
            return res.status(400).json({ error: 'Invalid OTP' })
        }

        return res.status(200).json({
            message:
                'OTP verified successfully. Proceed to change your password',
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Internal server error' })
    }
}

export const resetPassword = async (req: Request, res: Response) => {
    const { newPassword, confirmPassword } = req.body
    const reg = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]+$/g
    const checker = reg.test(newPassword)
    try {
        const token = req.body.cookie

        if (!token) {
            return res.status(400).json({ error: 'Token not found' })
        }

        const isValidToken = validatePasswordResetToken(token)
        if (!isValidToken) {
            return res.status(400).json({ error: 'Invalid or expired token' })
        }

        const decodedToken: any = jwt.decode(token)
        const { email } = decodedToken

        const user = await User.findOne({ where: { email } })
        if (!user) {
            return res.status(404).json({ error: 'User not found' })
        }
        if (newPassword === '' || confirmPassword === '') {
            return res
                .status(400)
                .json({ error: 'password input field required' })
        }
        if (newPassword.length < 8 || confirmPassword.length < 8) {
            return res
                .status(400)
                .json({ error: 'password must be eight characters or more' })
        }
        if (checker === false) {
            return res.status(400).json({
                error: 'Password should contain at least one upperCase, one special character and a number',
            })
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({ error: 'Passwords do not match' })
        }

        const hashedPassword = await bcrypt.hash(newPassword, 12)

        await user.update({ password: hashedPassword })

        return res.status(200).json({
            message: 'Password changed successfully',
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Internal server error' })
    }
}
