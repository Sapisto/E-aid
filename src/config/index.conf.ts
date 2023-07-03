import * as dotenv from 'dotenv'
import { Sequelize } from 'sequelize'

dotenv.config()
export const dbName = String(process.env.DB_NAME)
export const dbHost = String(process.env.DB_HOST)
export const dbPort = Number(process.env.DB_PORT)
export const dbUser = String(process.env.DB_USER)
export const dbPass = String(process.env.DB_PASSWORD)

export const host = String(process.env.smtp_host)
export const port = Number(process.env.smtp_port)
export const username = String(process.env.sendinblue_user)
export const password = String(process.env.sendinblue_pass)

export const ADMIN_MAIL = String(process.env.ADMIN_MAIL)
export const EMAIL_TITLE = String(process.env.EMAIL_TITLE)
export const TEMPLATE = String(process.env.TEMPLATE)

export const adminEmail = String(process.env.ADMIN_EMAIL)
export const adminPassword = String(process.env.ADMIN_PASSWORD)

export const sequelize = new Sequelize(dbName, dbUser, dbPass, {
    dialect: 'mysql',
    host: dbHost,
    port: dbPort,
    dialectOptions: {
        ssl: { rejectUnauthorized: true },
    },
})

export const cloudinaryCloudName = String(process.env.CLOUDINARY_CLOUD_NAME)

export const cloudinaryAPIKey = String(process.env.CLOUDINARY_API_KEY)

export const cloudinaryAPISecret = String(process.env.CLOUDINARY_API_SECRET)

export const key = String(process.env.KEY)

export const appId = String(process.env.APP_ID)

export const secret = String(process.env.SECRET)

