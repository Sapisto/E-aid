import { Request } from 'express'
import passport, { Profile } from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth2'
import dotenv from 'dotenv'

dotenv.config()

const googleClientId = process.env.GOOGLE_CLIENT_ID
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET
const googleCallbackUrl = process.env.GOOGLE_CALLBACK_URL

if (!googleClientId || !googleClientSecret || !googleCallbackUrl) {
    throw new Error(
        'Missing required environment variables for GoogleStrategy.'
    )
}

interface User extends Profile {
    provider: string
    id: string
    displayName: string
}

// Serialize user
passport.serializeUser((user, done) => {
    done(null, user)
})

// Deserialize user
passport.deserializeUser((user: User | false | null | undefined, done) => {
    done(null, user)
})

passport.use(
    new GoogleStrategy(
        {
            clientID: googleClientId,
            clientSecret: googleClientSecret,
            callbackURL: googleCallbackUrl,
            passReqToCallback: true,
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (
            req: Request,
            accessToken: string,
            refreshToken: string,
            profile: Profile,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            done: any
        ) => {
            return done(null, profile)
        }
    )
)

export default passport
