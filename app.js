const express = require('express')
const app = express()

const mongoose = require('mongoose')
const PORT =5000
const {MONGOURI} = require('./key')

// importing models
require('./models/user')

// passing the all request in JSON
app.use(express.json())


app.use(require('./routes/auth'))


//connecting mongodb database
mongoose.connect(MONGOURI,{
    useNewUrlParser:true,
    useUnifiedTopology: true 
})
mongoose.connection.on('connected',()=>{
    console.log("connected to mongodb")
})
mongoose.connection.on('error',(err)=>{
    console.log("error connecting",err)
})
app.get('/',(req,res)=>{
    res.send("hello world!!")
})


app.listen(PORT,()=>{
    console.log("server is starting",PORT)

})
