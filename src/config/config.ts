import { config as dotenvConfig } from 'dotenv'
dotenvConfig()

// config is already defined in the global scope, so we can't use it as a variable name
const _config = {
  port: process.env.PORT || 3000,
  databaseUrl: process.env.MONGO_URI,
  env: process.env.NODE_ENV, // To Identify 'development' or 'production'
  jwtSecret: process.env.JWT_SECRET,
  cloudinaryName: process.env.CLOUDINARY_CLOUD_NAME,
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET,
  frontendDomain: process.env.FRONTEND_DOMAIN,
}

export const config = Object.freeze(_config) // freeze the object to prevent modification
