import express, { Request, Response } from 'express'
import { getLogger } from '../utils/loggers'
import nodemailer from 'nodemailer'
import { host, password, username, port } from '../config/index.conf'

const router = express.Router()
const logger = getLogger('index route')

/* GET home page. */
router.get('/', (req: Request, res: Response) => {
    logger.info('hello Express')
    const transporter = nodemailer.createTransport({
        host: host,
        port: port,
        auth: {
            user: username,
            pass: password,
        },
    })
    const mailOptions = {
        from: username,
        to: 'abdulwasiushittu1416@gmail.com',
        text: 'Click the link below to verify your email address',
        html: "<p><a href='https://www.google.com'>this link</a></p>",
    }
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            logger.info(error)
        } else {
            logger.info('Email sent: ' + info.response)
        }
    })
    res.render('index', { title: 'Express' })
})

export default router
