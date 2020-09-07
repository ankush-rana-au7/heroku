const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const User = mongoose.model("User")
const bcrypt = require('bcryptjs')


// //making signup route

router.post('/signup',(req,res)=>{
  const {name,email,password} = req.body 
  if(!email || !password || !name){
     return res.status(422).json({error:"required all fields"})
  }
  User.findOne({email:email})
  .then((savedUser)=>{
      if(savedUser){
        return res.status(422).json({error:"user already exist"})
      }
      //hashing password
      bcrypt.hash(password,15)
      .then(hashedpassword=>{
            const user = new User({
                email,
                password:hashedpassword,
                name,
                
            })
    
            user.save()
            .then(user=>{
              
                res.json({message:"successfully done"})
            })
            .catch(err=>{
                console.log(err)
            })
      })
     
  })
  .catch(err=>{
    console.log(err)
  })
})


//making signin route
router.post('/signin',(req,res)=>{
  const {email,password} = req.body
  if(!email || !password){
     return res.status(422).json({error:"require  email or password"})
  }
  User.findOne({email:email})
  .then(savedUser=>{
      if(!savedUser){
         return res.status(422).json({error:"Invalid Email or password"})
      }
      bcrypt.compare(password,savedUser.password)
      .then(doMatch=>{
          if(doMatch){
               res.json({message:"successfully signed in"})
          }
          else{
              return res.status(422).json({error:"Invalid Email or password"})
          }
      })
      .catch(err=>{
          console.log(err)
      })
  })
})

module.exports = router
