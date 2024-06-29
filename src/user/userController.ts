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
    res.status(201).json({
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

const loginUser = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body

  // 1. Validation
  if (!email || !password) {
    const error = createHttpError(400, 'All fields are required')
    return next(error)
  }

  // 2. check if user exists
  try {
    const user = await userModel.findOne({ email })
    if (!user) {
      return next(createHttpError(404, 'User not found'))
    }

    // 3. Check password
    try {
      const isSamePassword = await bcrypt.compare(password, user.password)
      if (!isSamePassword) {
        return next(createHttpError(401, 'Invalid credentials'))
      }

      // create new access token
      const token = sign({ sub: user._id }, config.jwtSecret as string, {
        expiresIn: '7d',
      })

      res.status(200).json({
        accessToken: token,
        user: {
          name: user.name,
          email: user.email,
        },
        message: 'User logged in successfully',
      })
    } catch (error) {
      return next(
        createHttpError(500, 'Something went wrong while comparing password')
      )
    }
  } catch (error) {
    return next(
      createHttpError(500, 'Something went wrong while getting registered user')
    )
  }
}

export { createUser, loginUser }
