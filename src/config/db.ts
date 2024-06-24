import mongoose from 'mongoose'
import { config } from './config'

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.databaseUrl as string) // cast to string
    console.log(`MongoDB Connected: ${conn.connection.host}`)

    mongoose.connection.on('error', (error) => {
      console.log('Error connecting to MongoDB', error)
    })
  } catch (error) {
    console.error(`Failed to connect to MongoDB: ${error}`)
    process.exit(1)
  }
}
