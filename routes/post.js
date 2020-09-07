const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const loginreq = require('../middleware/loginreq')
const Post = mongoose.model("Post")



//making route for all the post
router.get('/allpost',(req,res)=>{
    Post.find()
    .populate("postedBy","_id name")
    .populate("comments.postedBy","_id name")
    .sort('-createdAt')
    .then((posts)=>{
        res.json({posts})
    }).catch(err=>{
        console.log(err)
    })
    
})


//making creatpost router
router.post('/createpost',loginreq,(req,res)=>{
    const {title,body,pic} = req.body
    //conole.log(title,body,pic)
    
    if(!title || !body || !pic){
      return  res.status(422).json({error:"require all fields"})
    }
    req.user.password = undefined
    // console.log(req.user)
    // res.send("all good")

    const post = new Post({
        title,
        body,
        photo:pic,
        postedBy:req.user
    })
    post.save().then(result=>{
        res.json({post:result})
    })
    .catch(err=>{
        console.log(err)
    })
})


//all the post created by that user
router.get('/mypost',loginreq,(req,res)=>{
    Post.find({postedBy:req.user._id}) //quering by id who is loggedin
    .populate("postedBy","_id name")
    .then(mypost=>{
        res.json({mypost})
    })
    .catch(err=>{
        console.log(err)
    })
})



//making delete route unly those user can delete the post who loggedin
router.delete('/deletepost/:postId',loginreq,(req,res)=>{
    Post.findOne({_id:req.params.postId})
    .populate("postedBy","_id")
    .exec((err,post)=>{
        if(err || !post){
            return res.status(422).json({error:err})
        }
        if(post.postedBy._id.toString() === req.user._id.toString()){
              post.remove()
              .then(result=>{
                  res.json(result)
              }).catch(err=>{
                  console.log(err)
              })
        }
    })
})


//making like router this is update request we can write put reuest post will also work
router.put('/like',loginreq,(req,res)=>{
    Post.findByIdAndUpdate(req.body.postId,{
        $push:{likes:req.user._id}
    },{
        new:true
    }).exec((err,result)=>{
        if(err){
            return res.status(422).json({error:err})
        }else{
            res.json(result)
        }
    })
})

//making unlike router this is update request we can write put reuest post will also work
router.put('/unlike',loginreq,(req,res)=>{
    Post.findByIdAndUpdate(req.body.postId,{
        $pull:{likes:req.user._id}
    },{
        new:true
    })
    .populate("comments.postedBy","_id name")
    .populate("postedBy","_id name")
    .exec((err,result)=>{
        if(err){
            return res.status(422).json({error:err})
        }else{
            res.json(result)
        }
    })
})


//making comment route
router.put('/comment',loginreq,(req,res)=>{
    if (!req.body.text) {
        res.status(422).json({ error: 'Comment should not be empty'});
    }
    const comment = {
        text:req.body.text,
        postedBy:req.user._id
    }
    Post.findByIdAndUpdate(req.body.postId,{
        $push:{comments:comment}
    },{
        new:true
    })
    .populate("postedBy","_id name")
    .populate("comments.postedBy","_id name")
    .exec((err,result)=>{
        if(err){
            return res.status(422).json({error:err})
        }else{
            res.json(result)
        }
    })
})

module.exports = router