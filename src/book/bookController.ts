import { NextFunction, Request, Response } from 'express'
import path from 'node:path'
import cloudinary from '../config/cloudinary'

const createBook = async (req: Request, res: Response, next: NextFunction) => {
  // console.log(req.files)

  // create a multer type in typescript
  const files = req.files as { [fieldname: string]: Express.Multer.File[] }
  // upload cover images to cloudinary
  const coverImageType = files.coverImage[0].mimetype.split('/')[-1]
  const fileName = files.coverImage[0].filename
  const filePath = path.resolve(
    __dirname,
    '../../public/data/uploads',
    fileName
  )

  const uploadResult = await cloudinary.uploader.upload(filePath, {
    folder: 'book-covers',
    filename_override: fileName,
    format: coverImageType,
  })

  console.log('Upload result: ', uploadResult)

  // upload pdf files to cloudinary
  const bookFileName = files.file[0].filename
  const bookFilePath = path.resolve(
    __dirname,
    '../../public/data/uploads',
    bookFileName
  )

  const bookUploadResult = await cloudinary.uploader.upload(bookFilePath, {
    folder: 'books',
    resource_type: 'raw',
    filename_override: bookFileName,
    format: 'pdf',
  })

  console.log('Book upload result: ', bookUploadResult)

  res.json({ message: 'Book created successfully' })
}

export { createBook }
