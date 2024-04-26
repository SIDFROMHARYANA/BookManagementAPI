
const express = require('express');
var bodyParser = require('body-parser');

const route = require('./Routes/route')
const app = express();
const mongoose=require('mongoose')
mongoose.connect("mongodb+srv://sid:jaiguruji@cluster0.dbzpsfq.mongodb.net/?retryWrites=true&w=majority", {
    useNewUrlParser: true
})
.then( () => console.log("MongoDb is connected"))
.catch ( err => console.log(err) )



app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/', route);
app.listen(process.env.PORT || 3000, function () {
    console.log('Express app running on port ' + (process.env.PORT || 3000))
});



