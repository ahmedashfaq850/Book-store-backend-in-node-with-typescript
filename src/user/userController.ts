import { Request, Response, NextFunction } from 'express'
import createHttpError from 'http-errors'

const createUser = async (req: Request, res: Response, next: NextFunction) => {
  // steps to write controller
  const { name, email, password } = req.body
  // 1. Validation
  if (!name || !email || !password) {
    const error = createHttpError(400, 'All fields are required')
    return next(error)
  }
  // 2. Logic
  // 3. Response
  res.json({ message: 'User registered' })
}

export { createUser }
