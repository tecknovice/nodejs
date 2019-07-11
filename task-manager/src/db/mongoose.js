const mongoose = require('mongoose')
const connectURL = process.env.MONGODB_URL
mongoose.connect(connectURL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
})