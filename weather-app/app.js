const request = require('request')
const geocode = require('./utils/geocode')
const forecast = require('./utils/forecast')

const location = process.argv[2]
geocode(location, (error, { long, lat, place }) => {
    if (error) {
        return console.log(error)
    }
    forecast(long, lat, (error, forecastData) => {
        if (error) {
            return console.log(error)
        }
        console.log(place)
        console.log(forecastData)
    })
})

