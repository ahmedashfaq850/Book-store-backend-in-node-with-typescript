import { Request, Response, NextFunction } from 'express'
import createHttpError from 'http-errors'
import userModel from './userModel'
import bcrypt from 'bcrypt'
import { sign } from 'jsonwebtoken'
import { config } from '../config/config'

const createUser = async (req: Request, res: Response, next: NextFunction) => {
  // steps to write controller
  const { name, email, password } = req.body
  // 1. Validation
  if (!name || !email || !password) {
    const error = createHttpError(400, 'All fields are required')
    return next(error)
  }

  // 2. Logic
  // check if user already exists
  const user = await userModel.findOne({ email })
  if (user) {
    const error = HttpError(400, 'User already exists')
    return next(error)
  }

  // Hash password
  const hashPassword = await bcrypt.hash(password, 10)

  // create user
  const newUser = await userModel.create({
    name,
    email,
    password: hashPassword,
  })

  // JWT Token
  const token = sign({ sub: newUser._id }, config.jwtSecret as string, {expiresIn: '7d'})

  //Response
  res.json({ accessToken: token })
}

export { createUser }
function HttpError(arg0: number, arg1: string) {
  throw new Error('Function not implemented.')
}
