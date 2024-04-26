const mongoose = require("mongoose")
const ObjectId = mongoose.Schema.Types.ObjectId

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  excerpt: {
    type: String,
    required: true
  },
  authorId: {
    type: ObjectId,
    required: true,
    ref: "Author"
  }

  ,
  ISBN: {
    type: String,
    required: true,
    unique: true
  },
 
  
  deletedAt: {
    type: Date
  },
  isDeleted: { type: Boolean, default: false },
  publishedAt: {
    type: Date, required: true
  },
}, { timestamps: true });

module.exports = mongoose.model("Book", bookSchema);