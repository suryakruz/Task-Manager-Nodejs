var mongoose = require('mongoose')

var mongoDb = process.env.MONGODB_URL
mongoose.connect(mongoDb, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
})
