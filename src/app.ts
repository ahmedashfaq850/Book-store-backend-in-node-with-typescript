import express, { NextFunction, Request, Response } from 'express'
import createHttpError, { HttpError } from 'http-errors'
import globalErrorHandler from './middlewares/globalErrorHandler'

const app = express()

// routes
app.get('/', (req, res, next) => {
  const error = createHttpError(500, 'Internal new Server Error')
  throw error
  res.json({ message: 'Hello World' })
})

// Global Error Handler
app.use(globalErrorHandler)

export default app
