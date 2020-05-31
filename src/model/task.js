var mongoose = require('mongoose')
var validator = require('validator')

var taskSchema = new mongoose.Schema({
    storyPoints:
    {
        type: Number,
    },
    description:
    {
        type: String,
        required: true
    },
    owner:
    {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref:'User'
    } ,
    completed:
    {
        type: Boolean,
        required: true
    }
},
{
    timestamps: true
})

const task = mongoose.model('Task', taskSchema);

module.exports = task


