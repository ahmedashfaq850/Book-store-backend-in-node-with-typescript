import express, { NextFunction, Request, Response } from 'express'
import createHttpError from 'http-errors'
import globalErrorHandler from './middlewares/globalErrorHandler'
import userRouter from './user/userRouter'
import bookRouter from './book/bookRouter'
import cors from 'cors'
import { config } from './config/config'

const app = express()
app.use(
  cors({
    origin: config.frontendDomain,
  })
)
app.use(express.json())
// routes
app.get('/', (req, res, next) => {
  const error = createHttpError(500, 'Internal new Server Error')
  throw error
  res.json({ message: 'Hello World' })
})

// register routers
app.use('/api/users', userRouter)
app.use('/api/books', bookRouter)

// Global Error Handler
app.use(globalErrorHandler)

export default app
