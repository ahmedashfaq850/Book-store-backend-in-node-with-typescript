import { NextFunction, Request, Response } from 'express'
import path from 'node:path'
import fs from 'node:fs'
import cloudinary from '../config/cloudinary'
import createHttpError from 'http-errors'
import bookModel from './bookModel'
import { AuthRequest } from '../middlewares/authenticate'

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

    const _req = req as AuthRequest

    // Insert book into the database
    const newBook = await bookModel.create({
      title,
      genre,
      author: _req.userId,
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

const updateBook = async (req: Request, res: Response, next: NextFunction) => {
  const { title, genre } = req.body
  const bookId = req.params.bookId

  try {
    const book = await bookModel.findOne({ _id: bookId })

    // check if the book exists
    if (!book) {
      return next(createHttpError(404, 'Book not found'))
    }

    // check if author is the owner of the book
    const _req = req as AuthRequest
    if (book.author.toString() !== _req.userId) {
      return next(
        createHttpError(403, 'You are not authorized to update this book')
      )
    }

    // Now check if cover image and file are uploaded otherwise use the existing one
    const files = req.files as { [fieldname: string]: Express.Multer.File[] }

    let newCoverImage
    if (files.coverImage) {
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

      newCoverImage = uploadCoverImage.secure_url

      // Delete temporary files from the server
      await fs.promises.unlink(coverFilePath)
    }

    let newFile
    if (files.file) {
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

      newFile = uploadPdf.secure_url

      // Delete temporary files from the server
      await fs.promises.unlink(bookFilePath)
    }

    // Update the book
    const updatedBook = await bookModel.findOneAndUpdate(
      { _id: bookId },
      {
        title: title || book.title,
        genre: genre || book.genre,
        coverImage: newCoverImage ? newCoverImage : book.coverImage,
        file: newFile ? newFile : book.file,
      },
      {
        new: true,
      }
    )

    res.status(200).json({
      message: 'Book updated successfully',
      id: updatedBook?._id,
    })
  } catch (error) {
    return next(
      createHttpError(500, 'An error occurred while updating the book')
    )
  }
}

const getBooks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const books = await bookModel.find()
    res.status(200).json(books)
  } catch (error) {
    return next(
      createHttpError(500, 'An error occurred while fetching the books')
    )
  }
}

const getBook = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const bookId = req.params.bookId
    const book = await bookModel.findOne({ _id: bookId })
    if (!book) {
      return next(createHttpError(404, 'Book not found'))
    }
    res.status(200).json(book)
  } catch (error) {
    return next(
      createHttpError(500, 'An error occurred while fetching the book')
    )
  }
}

const deleteBook = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const bookId = req.params.bookId
    const book = await bookModel.findOne({ _id: bookId })
    if (!book) {
      return next(createHttpError(404, 'Book not found'))
    }

    // check if author is the owner of the book
    const _req = req as AuthRequest
    if (book.author.toString() !== _req.userId) {
      return next(
        createHttpError(403, 'You are not authorized to delete this book')
      )
    }

    // Now first delete the book from the cloudinary
    // to delete files from cloudinary first get the public_id
    const coverFileSplit = book.coverImage.split('/')
    const coverPublicId =
      coverFileSplit.at(-2) + '/' + coverFileSplit.at(-1)?.split('.')[0]

    const bookFileSplit = book.file.split('/')
    const bookPublicId = bookFileSplit.at(-2) + '/' + bookFileSplit.at(-1)

    // delete the files from cloudinary
    try {
      await cloudinary.uploader.destroy(coverPublicId)
      await cloudinary.uploader.destroy(bookPublicId)

      // Now delete the book from the database
      await bookModel.deleteOne({ _id: bookId })

      res.status(200).json({ message: 'Book deleted successfully' })
    } catch (error) {
      next(
        createHttpError(
          500,
          'An error occurred while deleting the book from cloudinary'
        )
      )
    }
  } catch (error) {
    return next(
      createHttpError(500, 'An error occurred while deleting the book')
    )
  }
}

export { createBook, updateBook, deleteBook, getBooks, getBook }
