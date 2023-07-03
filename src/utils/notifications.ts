// import { User, UserInfo } from '../models/db.model'
import nodemailer from 'nodemailer'
import { host, password, port, username } from '../config/index.conf'

import dotenv from 'dotenv'

dotenv.config()

export const generateOtp = () => {
    const otp = Math.floor(100000 + Math.random() * 900000)
    const expiry = new Date()

    expiry.setTime(new Date().getTime() + 30 * 60 * 1000)

    return { otp, expiry }
}

export const sendVerificationOTP = async (email: string, otp: number) => {
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
            subject: 'Account Verification OTP',
            html: `
  <div style="max-width:700px; font-size:110%; border:10px solid #ddd; 
  padding:50px 20px; margin:auto; ">
  <h2 style="text-transform:uppercase; text-align:center; color:teal;">
  Welcome to E-AID
  </h2>
  <p>Hi there, your otp is ${otp}, it will expire in 30mins</p>
  </div>
  `,
        }

        await transporter.sendMail(mailOptions)
    } catch (error) {
        console.error(error)
        throw new Error('Error sending account verification OTP')
    }
}

export const sendVerificationEmailToAdmin = async (
    email: string,
    fullName: string
) => {
    try {
        const adminEmail = 'eaidcustomerservice@gmail.com'

        const transporter = nodemailer.createTransport({
            host,
            port,
            auth: {
                user: username,
                pass: password,
            },
        })

        const mailOptions = {
            from: 'E-Aid <noreply@eaid-mails.com>',
            to: adminEmail,
            subject: 'New Doctor Registration',
            html: `
  <div style="max-width:700px; font-size:110%; border:10px solid #ddd; 
  padding:50px 20px; margin:auto; ">
  <h2 style="text-transform:uppercase; text-align:center; color:teal;">
  VERIFY NEW DOCTOR
  </h2>
  <p><strong>Name:</strong> ${fullName}</p>
  <p><strong>Email:</strong> ${email}</p>
  <a href=""> Verify Doctor</a>
  </div>
  `,
        }

        await transporter.sendMail(mailOptions)
        console.log('Verification email sent to admin successfully')
    } catch (error) {
        console.error('Error sending verification email to admin:', error)
        throw new Error('Failed to send verification email to admin')
    }
}

export const sendVerificationEmailToDoctor = async (
    email: string,
    status: string
) => {
    const subject =
        status === 'verified' ? 'Doctor Verification' : 'Doctor Unverification'
    const message =
        status === 'verified'
            ? 'Your account has been verified by the admin.'
            : 'Your account has been unverified by the admin.'

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
            subject: subject,
            html: `
          <div style="max-width:700px; font-size:110%; border:10px solid #ddd; 
          padding:50px 20px; margin:auto; ">
          <h2 style="text-transform:uppercase; text-align:center; color:teal;">
          Update On Verification Status
          </h2>
          <p>${message}</p>
          </div>
        `,
        }

        await transporter.sendMail(mailOptions)
    } catch (error) {
        console.error(error)
        throw new Error('Error sending verification email')
    }
}
