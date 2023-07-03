import express from 'express'
import {
    chatDoctor,
    chatUser,
    getDoctorReceived,
    getDoctorSent,
    getUserReceived,
    getUserSent,
} from '../controllers/chatController'

const router = express.Router()

router.post('/doctor/:doctorId', chatDoctor)
router.post('/user', chatUser)
router.get('/user/sent/:userId', getUserSent)
router.get('/doctor/sent/:doctorId', getDoctorSent)
router.get('/user/received/:userId', getUserReceived)
router.get('/doctor/received/:doctorId', getDoctorReceived)

export default router
