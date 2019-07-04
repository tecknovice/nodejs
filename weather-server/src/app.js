const express = require('express')
const path = require('path')
const hbs = require('hbs')

const app = express()

//define path for express config
const publicFolderPath = path.join(__dirname, '../public')
const partialsPath = path.join(__dirname, '../templates/partials')
const viewsPath = path.join(__dirname, '../templates/views')

//setup handlerbars engine and views location
app.set('view engine', 'hbs')
app.set('views', viewsPath)
hbs.registerPartials(partialsPath)

//setup static directory to serve
app.use(express.static(publicFolderPath))

app.get('', (req, res) => {
    res.render('index', {
        title: 'weather app',
        name: 'Hung'
    })
})

app.get('/about', (req, res) => {
    res.render('about', {
        title: 'about me',
        name: 'Hung'
    })
})

app.get('/help', (req, res) => {
    res.render('help', {
        title: 'help',
        name: 'Hung',
        content: 'this is some helpful text'
    })
})

app.get('/weather', (req, res) => {
    res.send({
        location: 'Hanoi',
        forecast: 'Cloudy and Rainy'
    })
})

app.get('/help/*',(req,res)=>{
    res.render('404',{
        title:'help article not found',
        name: 'Hung'
    })
})

app.get('*', (req, res) => {
    res.render('404',{
        title:'404 not found',
        name: 'Hung'
    })
})

app.listen(3000, () => {
    console.log('server up on port 3000')
})