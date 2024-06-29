import { Request, Response, NextFunction } from 'express'
import createHttpError from 'http-errors'
import userModel from './userModel'
import bcrypt from 'bcrypt'
import { sign } from 'jsonwebtoken'
import { config } from '../config/config'
import { User } from './userTypes'

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
  try {
    const user = await userModel.findOne({ email })
    if (user) {
      const error = createHttpError(400, 'User already exists')
      return next(error)
    }
  } catch (error) {
    return next(createHttpError(500, 'Something went wrong while getting user'))
  }

  let newUser: User

  try {
    // Hash password
    const hashPassword = await bcrypt.hash(password, 10)

    // create user
    newUser = await userModel.create({
      name,
      email,
      password: hashPassword,
    })
  } catch (error) {
    return next(
      createHttpError(500, 'Something went wrong while registering user')
    )
  }

  try {
    // JWT Token
    const token = sign({ sub: newUser._id }, config.jwtSecret as string, {
      expiresIn: '7d',
    })
    //Response
    res.json({
      accessToken: token,
      user: {
        name: newUser.name,
        email: newUser.email,
      },
      message: 'User registered successfully',
    })
  } catch (error) {
    return next(
      createHttpError(500, 'Something went wrong while generating token')
    )
  }
}

export { createUser }
