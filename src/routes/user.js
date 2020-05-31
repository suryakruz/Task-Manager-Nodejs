const express = require('express')
const router = express.Router();
const User = require('../model/user')
const auth = require('../authentication/auth')
const multer = require('multer')
var storage = multer.memoryStorage();
const sharp = require('sharp')

//get list of users
router.get('/user/me', auth, async(req,res)=>{    
    return res.status(200).send(req.user)
})

//create a new user
router.post('/users',async (req, res)=>{
    console.log("ulla")
    const user = new User(req.body)
    try
    {
        console.log(user)
      await user.save()
      const token = await user.generateAuthToken()
      return res.status(201).send({user, token}) 
    }
    catch(e)
    {
        return res.status(400).send(e)
    }
})

//login user
router.post('/user/login', async (req, res) =>{
    try
    {
        console.log("enterd")
     const user = await User.findByCredentials(req.body.email, req.body.password)
     const token = await user.generateAuthToken()

     res.send({user, token})
    }
    catch(e)
    {
       return res.status(404).send(e.message)
    }
})

//logout user
router.post('/user/logout', auth, async (req, res) => {

    try
    {
    req.user.tokens = req.user.tokens.filter((token) => {
        return token.token !== req.token
    })
    await req.user.save();
    res.status(200).send({"message": "logged out successfully"})
    }catch(e)
    {
        res.status(400).send();
    }
})

//logout all session
router.post('/user/logoutAll', auth, async (req, res) => {
    try
    {
        req.user.tokens = []
        await req.user.save();
        res.status(200).send({"message": "logged out of all sessions"})
    }catch(e)
    {
        res.status(400).send()
    }
})

//update a user by id
router.patch('/users/me', auth, async(req, res)=>{
try
{
    const updates = Object.keys(req.body)
    const allowedUpdates = ["name","email","password"]
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if(!isValidOperation)
    {
        throw new Error("invalid update Operation")
    }

    updates.forEach((update)=>{
        req.user[update] = req.body[update]
    })
    await req.user.save()
    return res.status(200).send(req.user);
}
catch(e)
{
     return res.status(400).send(e);
}
})

//delete a user
router.delete('/user/me', auth, async (req, res)=>{
    try
    {
        await req.user.remove();
       return res.status(200).send(req.user);
    }
    catch(e)
    {
        return res.status(400).send(e);
    }
})

const upload = multer({
    storage: storage,
    dest: 'avatars',
    limits : {
        fileSize: 1000000
    },
    fileFilter(req, file, cb){
        if(!file.originalname.match(/\.(jpg|jpeg)$/))
        {
            return cb(new Error("Please upload a jpg or jpeg"))
        }
        cb(undefined, true);
    }
})

//add a new avatar for user
router.post('/user/me/avatar', auth, upload.single('avatar'), async (req,res)=>{

    const buffer = await sharp(req.file.buffer).resize({width:250, height:250}).png().toBuffer()

    req.user.avatar = buffer
    await req.user.save()
     res.send("image added")
    }, 
    (error, req, res, next)=>{
    res.status(400).send({error: error.message})
})

//get avatar 
router.get('/user/:id/avatar', async(req, res)=>{
    try
    {
        const activeUser = await User.findById(req.params.id)
        if(!activeUser.avatar)
        {
            throw new Error("No avator is set for the user")
        }
        res.set('Content-Type', 'image/png')
        res.send(activeUser.avatar)
    }
    catch(e)
    {
        res.status(404).send({error: e.message})
    }
})

module.exports = router