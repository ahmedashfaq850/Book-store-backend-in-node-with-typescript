import { Book } from './bookType'
import { NextFunction, Request, Response } from 'express'
import path from 'node:path'
import fs from 'node:fs'
import cloudinary from '../config/cloudinary'
import createHttpError from 'http-errors'
import bookModel from './bookModel'
import { promises } from 'node:dns'

const createBook = async (req: Request, res: Response, next: NextFunction) => {
  const { title, genre } = req.body

  try {
    // Create a multer type in typescript
    const files = req.files as { [fieldname: string]: Express.Multer.File[] }

    // Validate fields
    if (!title || !genre || !files.coverImage || !files.file) {
      throw createHttpError(400, 'All fields are required')
    }

    // Upload cover images to Cloudinary
    const coverImageType = files.coverImage[0].mimetype.split('/').pop()
    const coverFileName = files.coverImage[0].filename
    const coverFilePath = path.resolve(
      __dirname,
      '../../public/data/uploads',
      coverFileName
    )

    const uploadCoverImage = await cloudinary.uploader.upload(coverFilePath, {
      folder: 'book-covers',
      filename_override: coverFileName,
      format: coverImageType,
    })

    // Upload PDF files to Cloudinary
    const bookFileName = files.file[0].filename
    const bookFilePath = path.resolve(
      __dirname,
      '../../public/data/uploads',
      bookFileName
    )

    const uploadPdf = await cloudinary.uploader.upload(bookFilePath, {
      folder: 'books',
      resource_type: 'raw',
      filename_override: bookFileName,
      format: 'pdf',
    })

    // Insert book into the database
    const newBook = await bookModel.create({
      title,
      genre,
      author: '66797ace8d8f50ce3af1d609',
      coverImage: uploadCoverImage.secure_url,
      file: uploadPdf.secure_url,
    })

    // Delete temporary files from the server
    await fs.promises.unlink(coverFilePath)
    await fs.promises.unlink(bookFilePath)

    res.status(201).json({
      message: 'Book created successfully',
      id: newBook._id,
    })
  } catch (error: any) {
    if (error.message.includes('Cloudinary')) {
      return next(createHttpError(500, 'Cloudinary uploading issue'))
    }
    return next(
      createHttpError(500, 'An error occurred while creating the book')
    )
  }
}

export { createBook }
