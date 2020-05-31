const jwt = require('jsonwebtoken')
const user = require('../model/user')

const auth = async function(req, res, next){
    try
    {
    const token = req.header('token')
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET)
    const activeUser = await user.findOne({_id:decodedToken._id, "tokens.token": token})
    if(!activeUser)
    {
        throw new Error()
    }
    req.token = token
    req.user = activeUser
    next()
    }
    catch(e)
    {
       res.send({error: "Invalid Authentication"})
    }
}

module.exports = auth