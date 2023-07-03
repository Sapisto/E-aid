import express from 'express'
import { getLogger } from '../utils/loggers'
import {
    register,
    verifyUserOtp,
    googleController,
    googleCallback,
    resendToken,
    login,
    verifyDoctor,
    googleLogin,
    getAllDoctors,
    doctorRegister,
    getUser,
    getAllUsers,
} from '../controllers/auth.controller'
import { registerValidator, loginValidator } from '../utils/utils'

const router = express.Router()
const logger = getLogger('USER_ROUTE')

/* GET users listing. */
router.get('/', (_req, res) => {
    logger.info('respond with a resource')
    res.send('respond with a resource')
})
router.post('/register', registerValidator, register)
router.post('/doctor', doctorRegister)
router.get('/google', googleController)
router.post('/google-login', googleLogin)
router.get('/google/callback', googleCallback)
router.post('/verify-user', verifyUserOtp)
router.post('/resend-token', resendToken)
router.post('/login', loginValidator, login)
router.post('/verify-doctor/:id', verifyDoctor)
router.get('/alldoctors', getAllDoctors)
router.get('/allusers', getAllUsers)
router.post('/user', getUser)
export default router
