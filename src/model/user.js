var mongoose = require('mongoose')
var validator = require('validator')
var bcrypt = require('bcrypt')
var task = require('../model/task')
var db = require('../connection/mongoose')
var jwt = require('jsonwebtoken')

var userSchema = new mongoose.Schema({
    name: {
       type: String,
    },
    empId: {
        type: Number,
    },
    email: {
        type: String,
        unique: true,
        required: true,
        validator(value) {
            if(!validator.isEmail(value))
            {
                throw new Error("Email is invalid")
            }
        }
    },
    password: {
        type: String,
        required: true
    },
    tokens:[
        {
            token: {
                type: String,
                required: true
            }
        }
    ],
    avatar:{
        type: Buffer
    }
},
{
    timestamps: true
}
)

userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
})

userSchema.methods.toJSON = function(){
    const activeUser = this
    const userObject = activeUser.toObject()
    
    delete userObject.tokens
    delete userObject.password
    delete userObject.avatar
    

    return userObject
}

userSchema.methods.generateAuthToken = async function(){
    const activeUser = this
    const token = jwt.sign({ _id :activeUser._id.toString() },process.env.JWT_SECRET)
    activeUser.tokens = activeUser.tokens.concat({token})
    activeUser.save()
    return token
}

userSchema.statics.findByCredentials = async(email, password) =>{
    const activeUser = await user.findOne({ email })
    console.log(activeUser)
    if(!activeUser)
    {
        throw new Error("invalid emailId")
    }
    const isMatch = await bcrypt.compare(password, activeUser.password)
    if(!isMatch)
    {
        throw new Error("invalid password")
    }
    return activeUser
}

userSchema.pre('save', async function(next){
    const user = this;
    if(user.isModified("password"))
    {
        user.password = await bcrypt.hash(user.password, 8)
    }
    next()
})

userSchema.pre('remove', async function(next){
    const user = this;
    await task.deleteMany({'owner': user._id})
    next()
})

const   user = mongoose.model('User', userSchema);

module.exports = user 
