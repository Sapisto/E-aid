import { getLogger } from './utils/loggers'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import dotenv from 'dotenv'
import express, { NextFunction, Request, Response } from 'express'
import session from 'express-session'
import createError from 'http-errors'
import logger from 'morgan'
import passport from 'passport'
import path from 'path'
import { sequelize } from './config/index.conf'
import fileupload from 'express-fileupload'

import axios from 'axios'

// All routes will be created here
import usersRouter from './routes/auth'
import indexRouter from './routes/index'
import resetRouter from './routes/resetpassword'
import articleRouter from './routes/articleRoutes'
import chatRoute from './routes/chatRoutes'

dotenv.config()
const app = express()
const logMessage = getLogger('Server Message:')

app.use(
    session({
        secret: process.env.SESSION_SECRET || '',
        resave: false,
        saveUninitialized: false,
    })
)

app.use(express.json())
app.use(cookieParser())
app.use(passport.initialize())
app.use(passport.session())

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'jade')

app.use(logger('dev'))

app.use(express.urlencoded({ extended: false }))

app.use(express.static(path.join(__dirname, 'public')))

app.use((req, res, next) => {
    res.setHeader(
        'Access-Control-Allow-Origin',
        'https://e-aid-66j7.onrender.com'
        // 'http://localhost:5173'
    )
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
    next()
})
app.get('/maps', async (req, res) => {
    try {
        const { query, radius, type, key } = req.query
        const apiUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json`

        const response = await axios.get(apiUrl, {
            params: {
                query,
                radius,
                type,
                key,
            },
        })
        res.json(response.data)
    } catch (error) {
        res.status(500).json({ error: 'An error occurred' })
    }
})
app.use(
    cors({
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
    })
)

app.use(
    fileupload({
        useTempFiles: true,
        // tempFileDir: '/tmp/',
        // limits: { fileSize: 50 * 1024 * 1024 },
    })
)

app.use('/', indexRouter)
app.use('/auth', usersRouter)
app.use('/password', resetRouter)
app.use('/article', articleRouter)
app.use('/chat', chatRoute)

const requestHandler = function (
    req: Request,
    res: Response,
    next: NextFunction
) {
    next(createError(404))
}
app.use(requestHandler)

// The server will be made to run here
const bootstrap = async () => {
    try {
        await sequelize.authenticate()
        logMessage.info('Database connected successfully')

        await sequelize.sync()
        console.log('Database synchronized')
    } catch (error) {
        console.error('Error connecting or synchronizing database:', error)
    }
}

bootstrap()
    .then(() => {
        console.log('All logged')
    })
    .catch((err) => {
        console.log(err)
    })

export default app
