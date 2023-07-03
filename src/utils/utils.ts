import { z } from 'zod'

const regexPassword =
    /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]+$/g
const passwordSchema = z
    .string({
        required_error: 'Password is required',
        invalid_type_error:
            'Password should contain at least one upperCase, one special character and a number',
    })
    .min(6, { message: 'password must be 8 or more character' })
    .max(255, { message: 'Name must not be more than 255 characters' })
    .regex(regexPassword, {
        message:
            'Password should contain at least one upperCase, one special character and a number',
    })

const registerSchema = z.object({
    body: z.object({
        fullName: z
            .string({
                required_error: 'Name is required',
                invalid_type_error: 'Name must not include special characters',
            })
            .min(3, { message: 'Name must be 3 or more character' })
            .max(255, { message: 'Name must not be more than 255 characters' }),

        email: z
            .string({
                required_error: 'Email is required',
                invalid_type_error:
                    'Email should contain only alphanumeric characters',
            })
            .min(3, { message: 'Email must be 3 or more character' })
            .max(255, {
                message: 'Email must not be more than 255 characters',
            })
            .email({ message: 'invalid email address' })
            .includes('@', { message: 'Email must include @' }),
        phone: z
            .string({
                required_error: 'Phone Number is required',
                invalid_type_error: 'Phone Number Must be alphanumeric',
            })
            .min(11, { message: 'Name must be 3 or more character' })
            .max(30, { message: 'Name must not be more than 255 characters' }),
        password: passwordSchema,
    }),
})

const loginSchema = z.object({
    body: z.object({
        email: z
            .string({
                required_error: 'Email is required',
                invalid_type_error:
                    'Email should contain only alphanumeric characters',
            })
            .min(3, { message: 'Email must be 3 or more character' })
            .max(255, { message: 'Email must not be more than 255 characters' })
            .email({ message: 'invalid email address' })
            .includes('@', { message: 'Email must include @' }),
        password: passwordSchema,
    }),
})

loginSchema.required()
registerSchema.required()

const validator: any = (schema: any) => (req: any, res: any, next: any) => {
    try {
        schema.parse({
            body: req.body,
        })
        next()
    } catch (err: any) {
        const error = err.errors.map((err: any) => {
            return err
        })
        console.log(error)
        res.send({ message: error[0].message })
    }
}

export const registerValidator = validator(registerSchema)
export const loginValidator = validator(loginSchema)
