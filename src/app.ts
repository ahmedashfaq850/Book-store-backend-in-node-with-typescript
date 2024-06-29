import express, { NextFunction, Request, Response } from 'express'
import createHttpError from 'http-errors'
import globalErrorHandler from './middlewares/globalErrorHandler'
import userRouter from './user/userRouter'

const app = express()
app.use(express.json())
// routes
app.get('/', (req, res, next) => {
  const error = createHttpError(500, 'Internal new Server Error')
  throw error
  res.json({ message: 'Hello World' })
})

// register userRouter
app.use('/api/users', userRouter)

// Global Error Handler
app.use(globalErrorHandler)

export default app
