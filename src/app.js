var express = require('express')
const userRouter = require('./routes/user')
const taskRouter = require('./routes/task')
var app = express()

const port = process.env.PORT || 3000;

app.use(express.json())
app.use(userRouter);
app.use(taskRouter);

app.listen(port, ()=>{
    console.log("application started")
})