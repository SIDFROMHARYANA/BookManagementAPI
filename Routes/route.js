 
  const express  = require("express")
  const router =express.Router()
  const authorcontroller =require("../Controllers/authorcontroller")
  const bookcontroller = require("../Controllers/bookcontroller")
  
  
  
  
  router.post('/register', authorcontroller.createauthor)
  

  router.post('/login', authorcontroller.authorLogin)
  

  router.post('/books', bookcontroller.createBook) 
  
  router.get('/books', bookcontroller.allBooks)  

  
  
  router.get('/books/:authorId', bookcontroller.getByAuthorId)  

  

  router.put('/books/:bookId', bookcontroller.updateBook) 

  
 
  router.delete('/books/:bookId', bookcontroller.deleteByBook) 


  
  
  //--------------------------handling for api routes-------------------------------------
  router.all("/**", (req, res) => {
      try{
          return res.status(400).send({status: false,msg: "The api you request is not available"})
      }catch(err){
          return res.status(500).send(err.message)
      }
  })
  
  module.exports = router;

  
   