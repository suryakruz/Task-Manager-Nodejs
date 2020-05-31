var express = require('express')
var auth = require('../authentication/auth')
var router = express.Router()
const Task = require('../model/task')

//get list of tasks
// /tasks?completed=true
// /tasks?items=10&skip=3
// /tasks?sortBy=createdAt:desc
router.get('/tasks', auth, async (req, res)=> {

    const match = {};
    const sort = {}

    if(req.query.completed)
    {
        match.completed = req.query.completed === 'true'
    }

    if(req.query.sortBy)
    {
        const parts = req.query.sortBy.split(":")
        sort[parts[0]] = parts[1] === 'desc'? -1 : 1
    }
    console.log(sort)

    try
    {
        //const tasks = await Task.find({"owner":req.user._id})
        await req.user.populate({
            path:'tasks',
            match,
            options:{
                limit:parseInt(req.query.limit),
                skip:parseInt(req.query.skip),
                sort
            }
        }).execPopulate()
        return res.status(200).send(req.user.tasks)
    }
    catch(e)
    {
        return res.status(400).send(e);
    }
})

//get task by Id
router.get('/task/:id', auth, async(req, res)=> {

    const id = req.params.id;
    try
    {
        const task = await Task.findOne({"_id": id,"owner": req.user._id})
        if(!task)
        {
            throw new Error()
        }
        res.status(200).send(task)
    }
    catch(e)
    {
        res.status(400).send({message:"cannot find task"})
    }

})

//create a task
router.post('/task', auth, async(req, res)=>{
   // const task = new Task(req.body);
   const task = new Task({
       ...req.body,
       "owner": req.user._id
   })
    try
    {
        await task.save()
        console.log("created")
        return res.status(201).send(task)
    }
    catch(e)
    {
        return res.status(400).send(e);
    }
})

//update a task
router.patch('/task/:id', auth, async (req, res)=>{
   try
   {
     const updates = Object.keys(req.body);
     const allowedUpdates = ["description", "storyPoints"];
     const isValidOperation = updates.every((update)=> allowedUpdates.includes(update))

     if(!isValidOperation)
     {
        return res.status(404).send("invalid update operation");
     }

     const task = await Task.findOne({'_id':req.params.id,'owner':req.user._id})
     if(!task)
     {
         return res.status(404).send("No Task Found");
     }

     updates.forEach((update)=>{
         task[update] = req.body[update]
     })

     await task.save(task)
     return res.status(200).send(task);
   }
   catch(e)
   {
       return res.status(400).send(e)
   }
})

router.delete('/task/:id', auth, async(req, res)=> {
    try
    {
        const task = await Task.findOneAndRemove({'_id':req.params.id,'owner':req.user._id})
        if(!task)
        {
            return res.status(404).send("No Task Found");
        }
        return res.status(200).send(task); 
    }
    catch(e)
    {
        return res.status(400).send(e)
    }
})

module.exports = router

