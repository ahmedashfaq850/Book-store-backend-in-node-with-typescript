import {config as dotenvConfig} from 'dotenv'
dotenvConfig()

// config is already defined in the global scope, so we can't use it as a variable name
const _config = {
    port: process.env.PORT || 3000,
}

export const config = Object.freeze(_config) // freeze the object to prevent modification