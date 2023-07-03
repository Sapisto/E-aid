import bcrypt from 'bcrypt'
import { NextFunction, Request, Response } from 'express'
import jwt, { JwtPayload } from 'jsonwebtoken'
import { Admin } from '../models/admin.model'
import { User } from '../models/auth.model'
import {
    generateOtp,
    // sendVerificationEmailToAdmin,
    // sendVerificationEmailToDoctor,
    sendVerificationOTP,
} from '../utils/notifications'
import passport from '../utils/passport-setup'
import { userInfo } from 'os'

const jwtsecret = process.env.JWT_SECRET as string

export const register = async (req: Request, res: Response) => {
    try {
        const { email, fullName, phone, password, role } = req.body

        if (!email || !fullName || !phone || !password || !role) {
            return res.status(400).json({
                Error: 'Please provide missing credential',
            })
        }

        const spliceFunction = (email: string) => {
            return email.slice(0, email.indexOf('.admin'))
        }

        if (email.includes('.admin')) {
            const existingUser = await User.findOne({
                where: { email: spliceFunction(email) },
            })
            if (existingUser) {
                return res
                    .status(400)
                    .json({ message: 'User with this email already exists' })
            }
            const existingAdmin = await Admin.findOne({
                where: { email: spliceFunction(email) },
            })
            if (existingAdmin) {
                return res
                    .status(400)
                    .json({ message: 'Admin with this email already exists' })
            }
            const saltRounds = 12
            const hashedPassword = await bcrypt.hash(password, saltRounds)

            const admin = await Admin.create({
                email: spliceFunction(email),
                fullName,
                phone,
                password: hashedPassword,
                role: 'admin',
            })
            return res
                .status(201)
                .json({ message: 'Admin registered successfully', admin })
        } else {
            const existingAdmin = await Admin.findOne({
                where: { email },
            })
            if (existingAdmin) {
                return res
                    .status(400)
                    .json({ message: 'Admin with this email already exists' })
            }

            const existingUser = await User.findOne({
                where: { email },
            })
            if (existingUser) {
                return res
                    .status(400)
                    .json({ message: 'User with this email already exists' })
            }
        }
        const saltRounds = 12
        const hashedPassword = await bcrypt.hash(password, saltRounds)
        const user = await User.create({
            email,
            fullName,
            phone,
            password: hashedPassword,
            status: 'pending',
            role: role.toLowerCase(),
        })

        const { otp, expiry } = generateOtp()
        await sendVerificationOTP(email, otp)

        user.otp = otp
        user.expiry = expiry
        user.status = 'active'
        await user.save()

        return res
            .status(201)
            .json({ message: 'Check email for verification OTP', user })
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error' })
    }
}

export const verifyUserOtp = async (req: Request, res: Response) => {
    try {
        const { otp } = req.body

        const user = await User.findOne({ where: { otp } })
        if (!user) {
            return res.status(403).json({ error: 'Please recheck OTP' })
        }

        if (otp !== user.otp) {
            return res.status(403).json({ error: 'Invalid OTP' })
        }

        user.status = 'verified'
        await user.save()

        return res.status(200).json({
            message: 'OTP verified successfully',
        })
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' })
    }
}

export const verifyDoctor = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const adminId = (req.user as User)?.id

        const doctor = await User.findOne({ where: { id, role: 'Doctor' } })
        if (!doctor) {
            return res.status(404).json({ error: 'Doctor not found' })
        }

        doctor.status = doctor.status === 'verified' ? 'pending' : 'verified'
        await doctor.save()

        if (adminId) {
            const admin = await Admin.findByPk(adminId)
            if (admin) {
                ;(doctor as User).adminId = admin.id
                await doctor.save()
            }
        }

        return res.status(200).json({
            message: `Doctor verification status updated to ${doctor.status}`,
            doctor,
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Internal server error' })
    }
}

export const resendToken = async (req: Request, res: Response) => {
    const { email } = req.body

    try {
        const user = await User.findOne({ where: { email } })

        if (!user) {
            return res.status(404).json({ error: 'User not found' })
        }

        const { otp, expiry } = generateOtp()
        user.otp = otp
        user.expiry = expiry
        await user.save()

        await sendVerificationOTP(email, otp)

        return res.status(200).json({ message: 'Token resent successfully' })
    } catch (error) {
        return res.status(500).json({ error: 'Internal server error' })
    }
}

export const googleController = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    passport.authenticate('google', { scope: ['profile', 'email'] })(
        req,
        res,
        next
    )
}

export const googleCallback = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    passport.authenticate(
        'google',
        {
            failureRedirect: '/failed',
        },
        async (err: Error, user: unknown) => {
            if (err) {
                return next(err)
            }

            const googleUser = user as {
                email: string
                displayName: string
                avatar: string
            }

            try {
                const existingUser = (await User.findOne({
                    where: {
                        email: googleUser.email,
                        fullName: googleUser.displayName,
                    },
                })) as unknown as { [key: string]: string }

                if (!existingUser) {
                    const newUser = await User.create({
                        email: googleUser.email,
                        fullName: googleUser.displayName,
                        phone: '',
                        password: '',
                        otp: null,
                        expiry: null,
                        status: 'verified',
                        avatar: googleUser.avatar,
                        role: 'user',
                    })
                    const { id } = newUser

                    const token = jwt.sign({ id }, jwtsecret, {
                        expiresIn: '30days',
                    })
                    res.cookie('token', token, {
                        httpOnly: true,
                        maxAge: 30 * 24 * 60 * 60 * 1000,
                    })
                }
                const id = existingUser
                const token = jwt.sign({ id }, jwtsecret, {
                    expiresIn: '30days',
                })
                res.cookie('token', token, {
                    // httpOnly: true,
                    maxAge: 30 * 24 * 60 * 60 * 1000,
                })
                // res.status(201).json({ existingUser })
                res.redirect('https://e-aid-66j7.onrender.com/signup')
                // res.redirect('http://localhost:5173/signup')
            } catch (error) {
                res.status(500).json({ error: 'Internal server error' })
            }
        }
    )(req, res, next)
}

export const googleLogin = async (req: Request, res: Response) => {
    const { email } = req.body

    try {
        const existingUser = await User.findOne({ where: { email } })
        if (!existingUser) {
            return res.status(404).json({ error: 'User not found' })
        }

        const token = jwt.sign({ email }, jwtsecret, {
            expiresIn: '30days',
        })
        res.cookie('token', token, {
            httpOnly: true,
            maxAge: 30 * 24 * 60 * 60 * 1000,
        })

        return res
            .status(200)
            .json({ message: 'Login successful', token, existingUser })
    } catch (error) {
        console.error(error)
        return res.status(500).json({ error })
    }
}
export const getAllDoctors = async (req: Request, res: Response) => {
    try {
        const allDoctors = await User.findAll({
            where: { role: 'doctor' || 'Doctor' },
        })
        if (!allDoctors) {
            res.status(404).json({ message: 'No doctors found' })
        }
        res.status(200).json({ message: 'All doctors found', allDoctors })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Internal server error' })
    }
}

export const getAllUsers = async (req: Request, res: Response) => {
    try {
        const allUsers = await User.findAll({
            where: { role: 'user' || 'User' },
        })
        if (!allUsers) {
            res.status(404).json({ message: 'No users found' })
        }
        res.status(200).json({ message: 'All users found', allUsers })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Internal server error' })
    }
}

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body

        const admin = await Admin.findOne({ where: { email } })
        if (admin) {
            const validAdmin = await bcrypt.compare(password, admin.password)
            if (!validAdmin) {
                return res.status(400).json({ Error: 'Invalid email/password' })
            }
            const { id } = admin
            const token = jwt.sign({ id }, jwtsecret, { expiresIn: '30days' })
            res.cookie('token', token, {
                httpOnly: true,
                maxAge: 30 * 24 * 60 * 60 * 1000,
            })

            return res.status(201).json({
                message: 'You have successfully logged in as admin',
                admin,
                token,
            })
        }

        const user = await User.findOne({ where: { email } })

        if (!user) {
            return res
                .status(404)
                .json({ Error: 'User not found kindly register' })
        }
        if (user.status === 'pending') {
            return res.status(400).json({ Error: 'Account not verified' })
        }

        const validUser = await bcrypt.compare(password, user.password)

        if (validUser) {
            const { id } = user
            const token = jwt.sign({ id }, jwtsecret, { expiresIn: '30days' })
            res.cookie('token', token, {
                httpOnly: true,
                maxAge: 30 * 24 * 60 * 60 * 1000,
            })

            return res.status(201).json({
                message: 'You have successfully logged in as user',
                user,
                token,
            })
        }

        return res.status(400).json({ Error: 'Invalid email/password' })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: 'Internal server error' })
    }
}

export const logout = (req: Request, res: Response) => {
    res.clearCookie('access_token', {
        sameSite: 'none',
        secure: true,
    })
        .status(200)
        .json('User has been logged out')
}

// export const doctorRegister = async (req: Request, res: Response) => {
//     try {
//         const { email, fullName, phone, password, role } = req.body
//         const files = req.files
//         console.log(req.body, files)
//         // if (fields) {
//         // const email = fields.email
//         // const fullName = fields.fullName
//         // const phone = fields.phone
//         // const password = fields.password
//         // const role = fields.role
//         if (typeof fullName !== 'string') {
//             return res.status(400).send('Invalid name')
//         }
//         if (typeof email !== 'string') {
//             return res.status(400).send('Invalid email')
//         }
//         if (typeof phone !== 'string') {
//             return res.status(400).send('Invalid Phone Number')
//         }
//         if (typeof role !== 'string') {
//             return res.status(400).send('Invalid role')
//         }

//         const existingUser = await User.findOne({ where: { email } })
//         if (existingUser) {
//             return res
//                 .status(400)
//                 .json({ message: 'Doctor with this email already exists' })
//         }
//         if (typeof password !== 'string') {
//             return res.status(400).send('Invalid password')
//         }
//         const saltRounds = 12
//         const hashedPassword = await bcrypt.hash(password, saltRounds)
//         const fileArray = Array.isArray(files) ? files : [files]
//         const cvPath = fileArray[0]?.CV?.data

//         const fileData = fs.readFileSync(cvPath)

//         const newDoctor = await User.create({
//             fullName,
//             email,
//             password: hashedPassword,
//             CV: fileData,
//             phone,
//             role: role.toLowerCase(),
//             status: 'pending',
//         })
//         // await sendVerificationEmailToAdmin(email, fullName)
//         return res.status(201).json({
//             message: 'Your account has been created successfully',
//             newDoctor,
//         })
//         // }
//     } catch (err) {
//         console.log(err)
//         return res.status(500).json({ message: 'Internal server error' })
//     }
// }
export const doctorRegister = async (req: Request, res: Response) => {
    try {
        const { email, fullName, phone, password, role, specialty } = req.body
        const files = req.files
        console.log(files)

        if (!files) {
            return res.status(400).json({ error: 'No file provided' })
        }

        const existingUser = await User.findOne({ where: { email } })
        if (existingUser) {
            return res
                .status(400)
                .json({ error: 'Doctor with this email already exists' })
        }

        const saltRounds = 12
        const hashedPassword = await bcrypt.hash(password, saltRounds)
        const fileArray = Array.isArray(files) ? files : [files]
        const fileData = fileArray[0]?.CV.tempFilePath // Convert file data to base64 string
        // console.log(fileData)

        const newDoctor = await User.create({
            fullName,
            email,
            password: hashedPassword,
            CV: fileData, // Save the base64 string of the file data in the CV field
            specialty,
            phone,
            role: role.toLowerCase(),
            status: 'pending',
        })

        return res.status(201).json({
            message: 'Your account has been created successfully',
            newDoctor,
        })
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: 'Internal server error' })
    }
}

export const getUser = async (req: Request, res: Response) => {
    const { userToken } = req.body

    try {
        const decodedToken = jwt.verify(userToken, jwtsecret) as {
            id: string
        }
        if (!decodedToken) {
            res.status(404).json({ message: 'User not found' })
        }
        const { id } = decodedToken
        res.status(200).json(id)
    } catch (error) {
        res.status(500).json(error)
    }
}
