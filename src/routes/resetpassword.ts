import express from 'express'
import { genOtp, verifyOtp, resetPassword } from '../controllers/resetpassword'

const router = express.Router()

router.post('/forgot', genOtp)

router.post('/verify', verifyOtp)

router.post('/reset', resetPassword)

export default router
