const express = require('express')
require('./db/mongoose')
const userRouter = require('./routers/user')
const taskRouter = require('./routers/task')

const port = process.env.PORT
const app = express()

//middleware for maintenance mode
// app.use((req,res,next)=>{
//     res.status(503).send('Site is under maintenance')
// })

// const errorMiddleware = (req,res,next) =>{
//     throw new Error('From error middleware')
// }

app.use(express.json())
app.use(userRouter)
app.use(taskRouter)

app.listen(port, () => console.log('server is up on port ' + port))

