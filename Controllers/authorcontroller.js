
const authormodel = require('../Models/author')
const validation = require('../validator/validation')
const jwt = require('jsonwebtoken')


//===============createuser========
const createauthor = async function (req, res) {
  try {
    const author = req.body 
    

     //if entries are empty
    if (!validation.isValidRequestBody(author)) {
      return res.status(400).send({
        status: false,
        message: "data is required",
      })
    }

    //destructuring the entries
    const { title, name, phone, email, password} = author

    //checking for only the request body enteries only 
    const compare =['title', 'name', 'phone', 'email', 'password']
    if (!Object.keys(author).every(elem => compare.includes(elem)))
    return res.status(400).send({ status: false, msg: "wrong entries given" });

    //checking uniqueness for email and phone in usermodel
    const checkAuthor =  await authormodel.findOne({$or:[{phone:phone, isDeleted: false},{email:email,isDeleted: false}]});
    if(checkAuthor)
    return res.status(400).send({status:false, message:'email id and phone number already present in database try different one!'})

   //validation for title
    if (!validation.isValidTitle(title)) {
      return res
        .status(400)
        .send({ status: false, message: "Title is required" });
    }
    //============name validation============
    if (!validation.regixValidator(name)) {
      return res.status(400).send({
        status: false,
        message:
          "name is required."
      });
    }
    //===========phone validation=========
    if (!validation.isValidMobile(phone)) 
      return res.status(400).send({
        status: false,
        message: "Phone no is required."
      });
    

    //======email validation============
    if (!validation.isValidEmail(email)) {
      return res.status(400).send({
        status: false,
        message: "email is required."
      });
    }

    //============password validation=======
    if (!validation.isValidPassword(password)) {
      return res.status(400).send({
        status: false,
        message: "provide valid password"
      });
    }


    
    //creating user data
    const createNew = await authormodel.create(author)
    res.status(201).send({ status: true, message: 'Success', data: createNew })

  } catch (err) {
    res.status(500).send({ status: false, message: err.message })
  }
}

//---------------------- generation of token ----------------------------------- 
const authorLogin = async function (req, res) {
  try {
    const author = req.body;

    //if entries are empty
    if (!validation.isValidRequestBody(author)) {
      return res.status(400).send({ status: false, message: "Invalid request parameter, please provide Author Details" });
    }

    const email = author.email;
    const password = author.password;

    //validation for email and password
    if (!validation.isValidEmail(email)) {
      return res.status(400).send({ status: false, message: "email is required." });
    }

    if (!validation.isValidPassword(password)) {
      return res.status(400).send({ status: false, message: "provide valid password" });
    }

    const loginAuthor = await authormodel.findOne({ email: email, password: password });
    
    //validation for userLogin
    if (!loginAuthor) {
      return res.status(400).send({ status: false, msg: "Author Details Invalid" });
    }

    
        // Token generation
        jwt.sign(
          {
            authorId: loginAuthor._id.toString(),
            userStatus: "active",
            iat: Date.now()  // issueAt
          },
          "BookManagementAPI",
          { expiresIn: "24h" },
          (error, token) => {
            if (error) {
              return res.status(500).send({ status: false, message: "Error generating token" });
            }
    
            // Created object for the response
            const jwtToken = { token: token, authorId: loginAuthor._id, iat: Date.now(), exp: new Date(Date.now()) };
    
            res.setHeader('token-key', token);
    
            return res.status(200).send({ status: true, message: "Success", data: jwtToken });
          }
        );
      } catch (err) {
        return res.status(500).send({ status: false, message: err.message });
      }
    }
  

    

 module.exports.createauthor = createauthor
 module.exports.authorLogin = authorLogin;






