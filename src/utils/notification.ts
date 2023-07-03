import nodemailer from 'nodemailer'
import { Response } from 'express'
import {
    host,
    port,
    username,
    password,
    ADMIN_MAIL,
    EMAIL_TITLE,
} from '../config/index.conf'
import { User } from '../models/auth.model'

// OTP
export const GenerateOtp = () => {
    const otp = Math.floor(100000 + Math.random() * 900000)
    const expiry = new Date()

    expiry.setTime(new Date().getTime() + 30 * 60 * 1000)

    return { otp, expiry }
}

// Verify OTP
export const verifyOtp = async (otp: number, res: Response) => {
    const user = await User.findOne({ where: { otp } })

    if (!user) {
        return res
            .status(404)
            .json({ error: 'User not found, kindly register' })
    }

    return otp
}

// EMAIL
const transport = nodemailer.createTransport({
    host: host,
    port: port,
    auth: {
        user: username,
        pass: password,
    },
})

export const sendEmail = async (
    from: string,
    to: string,
    subject: string,
    html: string
) => {
    try {
        const response = await transport.sendMail({
            from: ADMIN_MAIL,
            to,
            subject: EMAIL_TITLE,
            html,
        })
        return response
    } catch (error) {
        console.log(error)
    }
}

export const emailHtml = (otp: number): string => {
    const temp = `
  <div style="max-width:700px; font-size:110%; border:10px solid #ddd; 
  padding:50px 20px; margin:auto; ">
  <h2 style="text-transform:uppercase; text-align:center; color:teal;">
  Welcome to E-AID
  </h2>
  <p>Hi there, your otp is ${otp}, it will expire in 30mins</p>
  </div>
  `
    return temp
}
