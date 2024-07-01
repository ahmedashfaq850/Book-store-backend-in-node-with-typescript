import { NextFunction, Request, Response } from 'express'
import { verify } from 'jsonwebtoken'
import { config } from '../config/config'
import createHttpError from 'http-errors'

export interface AuthRequest extends Request {
  userId: string
}

const authenticate = (req: Request, res: Response, next: NextFunction) => {
  // extract the token first
  const token = req.header('Authorization')

  if (!token) {
    return res.status(401).json({ message: 'Authorization token is required' })
  }

  try {
    // verify the token
    const parseToken = token.split(' ')[1] // Bearer token number
    // Now decode the token
    const decode = verify(parseToken, config.jwtSecret as string)
    const _req = req as AuthRequest
    _req.userId = decode.sub as string
    next() // this is usd to pass the request to the next middleware or controller
  } catch (error) {
    return next(createHttpError(401, 'Token is invalid or expired'))
  }
}

export default authenticate
