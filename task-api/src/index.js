const app = require('./app')

const port = process.env.PORT

//middleware for maintenance mode
// app.use((req,res,next)=>{
//     res.status(503).send('Site is under maintenance')
// })

// const errorMiddleware = (req,res,next) =>{
//     throw new Error('From error middleware')
// }


app.listen(port, () => console.log('server is up on port ' + port))

