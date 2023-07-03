import nodemailer from 'nodemailer'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config()

export const generatePasswordResetOtp = () => {
    const otp = Math.floor(100000 + Math.random() * 900000)
    const expiry = new Date()

    expiry.setTime(new Date().getTime() + 30 * 60 * 1000)

    return { otp, expiry }
}

export const sendPasswordResetOTP = async (email: string, otp: number) => {
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.smtp_host,
            port: 587,
            auth: {
                user: process.env.sendinblue_user,
                pass: process.env.sendinblue_pass,
            },
        })

        const mailOptions = {
            from: 'E-Aid <noreply@eaid-mails.com>',
            to: email,
            subject: 'Password Reset OTP',
            html: `
   <div style="max-width:700px; font-size:110%; border:10px solid #ddd; 
  padding:50px 20px; margin:auto; ">
  <p>Your OTP to reset your password is:</p>
    <h1>${otp}</h1>
    <p>Please enter this OTP to reset your password.</p>
    <p>Note that the OTP is only valid for 30 minutes.</p>
    <p>If you did not make this request, please ignore this email.</p>
    `,
        }

        await transporter.sendMail(mailOptions)
    } catch (error) {
        console.error(error)
        throw new Error('Error sending password reset OTP')
    }
}

export const generatePasswordResetToken = async (
    email: string,
    res: Response | any
) => {
    const payload = {
        email: email,
    }

    try {
        const token = jwt.sign(
            payload,
            process.env.PASSWORD_RESET_SECRET as string,
            { expiresIn: '30min' }
        )

        res.cookie('token', token, {
            httpOnly: true,
            maxAge: 30 * 60 * 1000,
        })

        return token
    } catch (error) {
        console.error(error)
        throw new Error('Error generating password reset token')
    }
}

export const validatePasswordResetToken = async (token: string) => {
    try {
        const decodedToken: any = jwt.verify(
            token,
            process.env.PASSWORD_RESET_SECRET as string
        )
        const expiry = new Date(decodedToken.expiry)
        if (expiry.getTime() < new Date().getTime()) {
            return false
        }
        return true
    } catch (error) {
        console.error(error)
        return false
    }
}
