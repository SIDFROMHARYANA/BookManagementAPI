
 
const mongoose = require("mongoose")

const authorSchema = new mongoose.Schema({
  title: {
    type : String,
    required : true,
    enum : ["Mr", "Mrs", "Miss"]
  },
  name : {
    type : String,
    required : true
  },
  phone: {
    type : String,
    unique : true,
    required : true
},
email: {
  type : String,
  required : true,
  unique : true
},
password: {
  type : String, 
  required : true
},

}, {timestamps : true});

module.exports = mongoose.model("Author", authorSchema)