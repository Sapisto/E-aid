import { Request, Response } from 'express'
import { key, appId, secret } from '../config/index.conf'
import Pusher from 'pusher'
import { User, Message } from '../models/auth.model'

const pusher = new Pusher({
    appId: appId,
    key: key,
    secret: secret,
    cluster: 'mt1',
    useTLS: true,
})

export const chatDoctor = async (req: Request, res: Response) => {
    const { message, userId } = req.body
    const doctorId = req.params.doctorId

    try {
        // Save the message in the database
        const doctor = await User.findByPk(doctorId)
        if (!doctor) {
            return res.status(404).json({ error: 'Doctor not found' })
        }

        const user = await User.findByPk(userId)
        if (!user) {
            return res.status(404).json({ error: 'User not found' })
        }

        // Add the message to the doctor's messages array
        await Message.create({
            message: message,
            recipientId: doctor.id,
            senderId: user.id,
        })

        // Trigger Pusher event for the selected doctor
        pusher.trigger(`private-chat-${user.id}`, 'message', {
            message: message,
        })

        return res.status(201).json({ message: 'Message sent successfully' })
    } catch (error) {
        console.error('Error saving message:', error)
        return res.status(500).json({ error: 'Failed to save message' })
    }
}

export const chatUser = async (req: Request, res: Response) => {
    const { doctorId, message, userId } = req.body
    console.log(doctorId, message, userId)

    try {
        if (!userId) {
            return res
                .status(404)
                .json({ error: 'User not found or not authenticated' })
        }

        const user = await User.findByPk(userId)
        if (!user) {
            return res.status(404).json({ error: 'User not found' })
        }

        const doctor = await User.findOne({ where: { id: doctorId } })
        if (!doctor) {
            return res.status(404).json({ error: 'Doctor not found' })
        }

        // Add the message to the user's messages array
        await Message.create({
            message: message,
            recipientId: user.id,
            senderId: doctorId,
        })

        // Trigger Pusher event for the user
        pusher.trigger(`private-chat-${user.id}`, 'message', {
            message: message,
        })

        return res.status(201).json({ message: 'Message sent successfully' })
    } catch (error) {
        console.error('Error saving message:', error)
        return res.status(500).json({ error: 'Failed to save message' })
    }
}

export const getDoctorSent = async (req: Request, res: Response) => {
    const { doctorId } = req.params
    try {
        const doctorSent = await Message.findAll({
            where: { senderId: doctorId },
        })
        if (!doctorSent) {
            return res.status(404).json({ message: 'No chats found' })
        }
        return res.status(200).json(doctorSent)
    } catch (error) {
        return res.status(500).json(error)
    }
}
export const getDoctorReceived = async (req: Request, res: Response) => {
    const { doctorId } = req.params
    try {
        const doctorReceived = await Message.findAll({
            where: { recipientId: doctorId },
        })
        if (!doctorReceived) {
            return res.status(404).json({ message: 'No chats found' })
        }
        res.status(200).json(doctorReceived)
    } catch (error) {
        return res.status(500).json(error)
    }
}
export const getUserSent = async (req: Request, res: Response) => {
    const { userId } = req.params
    console.log('user Id = ' + userId)

    try {
        const userSent = await Message.findAll({
            where: { senderId: userId },
        })
        if (!userSent) {
            return res.status(404).json({ message: 'No chats found' })
        }
        return res.status(200).json(userSent)
    } catch (error) {
        return res.status(500).json(error)
    }
}
export const getUserReceived = async (req: Request, res: Response) => {
    const { userId } = req.params
    try {
        const userReceived = await Message.findAll({
            where: { recipientId: userId },
        })
        if (!userReceived) {
            res.status(404).json({ message: 'No chats found' })
        }
        return res.status(200).json(userReceived)
    } catch (error) {
        return res.status(500).json(error)
    }
}
