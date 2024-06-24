import {config as dotenvConfig} from 'dotenv'
dotenvConfig()

// config is already defined in the global scope, so we can't use it as a variable name
const _config = {
    port: process.env.PORT || 3000,
    databaseUrl: process.env.MONGO_URI,
    env: process.env.NODE_ENV,
    jwtSecret: process.env.JWT_SECRET,
}

export const config = Object.freeze(_config) // freeze the object to prevent modification