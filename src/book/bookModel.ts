import mongoose from 'mongoose'
import { Book } from './bookType'

const BookSchema = new mongoose.Schema<Book>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    genre: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    coverImage: {
      type: String,
      required: true,
      trim: true,
    },
    file: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
)

export default mongoose.model<Book>('Book', BookSchema)
