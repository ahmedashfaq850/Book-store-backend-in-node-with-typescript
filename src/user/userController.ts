import { Request, Response, NextFunction } from 'express'
import createHttpError from 'http-errors'
import userModel from './userModel'

const createUser = async (req: Request, res: Response, next: NextFunction) => {
  // steps to write controller
  const { name, email, password } = req.body
  // 1. Validation
  if (!name || !email || !password) {
    const error = createHttpError(400, 'All fields are required')
    return next(error)
  }
  // check if user already exists
  const user = await userModel.findOne({ email })
  if (user) {
    const error = HttpError(400, 'User already exists')
    return next(error)
  }
  // 2. Logic
  // 3. Response
  res.json({ message: 'User registered' })
}

export { createUser }
function HttpError(arg0: number, arg1: string) {
  throw new Error('Function not implemented.')
}
