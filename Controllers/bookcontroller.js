
const bookmodel = require('../Models/book')
const authormodel = require('../Models/author')

const validation = require('../validator/validation')

const createBook = async function (req, res) {
    try {
        const data = req.body
        const { title, excerpt, authorId, ISBN, publishedAt } = data
        
        
        //-----------------------------------------------------------------------------------------
        if (!validation.isValidRequestBody(data)) {
            return res.status(400).send({status: false, message: "Invalid request parameter, please provide Book Details"})
        }

        const compare =['title', 'excerpt', 'authorId', 'ISBN','publishedAt']
        
        if (!Object.keys(data).every(elem => compare.includes(elem)))
        
        return res.status(400).send({ status: false, msg: "wrong entries given" });

       
        //----------------------------Title Validation-----------------------------------------------------
         data.title = title.toUpperCase()
        
        if(!/^[a-zA-Z_]+( [a-zA-Z_]+)*$/.test(title)){
            return res.status(400).send({
                status : false,
                message : "Title should be string and unique"

            })
        }


      //------------------------ISBN validation-------------------------------------------
        if (!validation.isValid(ISBN))
            return res.status(400).send({ status: false, message: 'ISBN is required' })
        
        if (!validation.isValidISBN(ISBN))
            return res.status(400).send({ status: false, message: 'ISBN should be unique number [XXX-XXXXXXXXXX] !' })


         //for unquie validation in bookModel for ISBN and Title
         const checkUniqueTitleAndISBN = await bookmodel.findOne(({$or:[{title : title, isDeleted: false},{ISBN : ISBN, isDeleted: false}]}))

         //checking for unique title 
         if(checkUniqueTitleAndISBN){
             return res.status(400).send({
                 status : false,
                 message : "Title and ISBN is already present please provide unique Title and ISBN"
             
             })
         } 
         

        //---------------------------excerpt validation-------------------------------
        if (!validation.isValid(excerpt))
            return res.status(400).send({ status: false, message: 'Excerpt is required' })

        if(!/^[a-zA-Z_]+( [a-zA-Z_]+)*$/.test(excerpt)){
            return res.status(400).send({status : false, message : "excerpt should be string"})
            }

        //-------------------authorId validation-------------------------------------------

        if (!await authormodel.findById(authorId))
            return res.status(400).send({ status: false, msg: "Invalid authorId!" })


        //----------------------------------publishedAt Validation-------------------------------------------
        if (!validation.isValid(publishedAt))
            return res.status(400).send({ status: false, message: 'publishedAt is required' })

        if (!/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/.test(publishedAt))
            return res.status(400).send({ status: false, message: 'Please provide valid date format YYYY-MM-DD !' })

        //-----------------------------------BOOK Creation------------------------------------
       
        const bookCreate = await bookmodel.create(data)
        return res.status(201).send({ status: true, message: 'Successfully book created', data: bookCreate })
    
    } catch (err) {
       return res.status(500).send({ status: false, message: err.message })
    }
}

//===============================================get all books via filters==================================
const allBooks = async function (req, res) {
    try {
        
        //===========================check this to get all bokks


        let body = req.query

        //apart from this entries gives error
        const compare =['authorId', 'ISBN']
        if (!Object.keys(body).every(elem => compare.includes(elem)))
        return res.status(400).send({ status: false, msg: "wrong entries given" });

        //setting the isDeleted false in body

        let obj = { isDeleted: false }

        //checking for authorId
        if (body.authorId) {
            if (!/^[0-9a-fA-F]{24}$/.test(body.authorId)) {
                return res.status(400).send({ status: false, message: "Invalid authorId" })
            }
            obj.authorId = body.authorId
        }


        //finding the book as per the book_id, title, excerpt, authorId, publishedAt
        let findbook = await bookmodel.find(obj).select({
            ISBN : 0,
            isDeleted : 0,
            deletedAt : 0
        })

        //checking for no book 
        if(!(findbook.length > 0)){
            return res.status(404).send({
                status : false,
                message : "No book found"
            })
        }

        // alphabetically sorting the title
        let sortedData = findbook.sort(function (a, b){
            if(a.title < b.title) {
                 return -1 
                }
        })

        return res.status(200).send({
            status : true,
            message:"Books returned successfully",
            data : findbook
        })
    } catch (error) {
        res.status(500).send({
            status: false,
            message: error.message
        })
    }
}

//=============================get book details by particular author============================================
const getByAuthorId = async function (req, res) {

    try {

        //extract the bookId 
        const authorId = req.params.authorId
      

        //find all books with the prticular author
        const bookauthors = await bookmodel.find({authorId:authorId,isDeleted:false}).select({isDeleted:0,createdAt:0,updatedAt:0,__v:0})

        //if book not found or isDeleted is true then we can say book not found
        if ( bookauthors.length === 0) {
            return res.status(404).send({
                status: false,
                message: "Book not found"
            })
        } else {
            
            return res.status(200).send({
                status: true,
                message:"authors found with these books",
                data: bookauthors
            })
        }
    } catch (error) {
        res.status(500).send({
            status: false,
            message: error.message
        })
    }

}



//==============================delete by BookId=============================================

const deleteByBook = async function(req, res){
    
try{
    //bookId    
    const bookId = req.params.bookId

    //for checking bookId and isDeleted false and set isDeleted to true
   const bookDeleted=await bookmodel.findOneAndUpdate({_id:bookId, isDeleted:false},{$set:{isDeleted:true, deletedAt: Date.now()}},{ new:true})

   return res.status(200).send({status:true, message:'successfully Deleted'})
    
}catch(err){
    res.status(500).send({status:false, message:err.message})
}

}


//==================================updateBook==========================================================

const updateBook = async function (req, res) {

    try {
        //get the bookId
        const bookId = req.params.bookId
        //find the book with bookId
        const book = await bookmodel.findById(bookId)

        //check for book not presetn and isDelete true - book not available
        if (!book || book.isDeleted == true) {
            return res.status(404).send({
                status: false,
                message: "Book not found in db or it is deleted"
            })
        }

        //updating 
        //checking for requestBody
        const requestBody = req.body

        //destructure the requestbody
        const { title, excerpt, ISBN, publishedAt } = requestBody


        if (!validation.isValidRequestBody(requestBody)) {
            return res.status(400).send({
                status: false,
                message: "Please provide the Upadate details"
            })
        }
      
        //updating the book
        const updatedBook = await bookmodel.findOneAndUpdate({ _id: bookId }, book, { new: true })
        return res
            .status(200)
            .send({ status: true, message: "successfully updated", data: updatedBook })

    } catch (error) {
        return res.status(500).send({ message: error.message })
    }
}


module.exports.updateBook = updateBook
module.exports.createBook = createBook
module.exports.allBooks = allBooks
module.exports.getByAuthorId = getByAuthorId
module.exports.deleteByBook = deleteByBook

