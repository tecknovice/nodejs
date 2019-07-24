const request = require('request')

const forecast = (long, lat, callback) => {
    const url = `https://api.darksky.net/forecast/c2b49c819b918711ff77818f09b317d9/${lat},${long}?units=si`
    request({ url, json: true }, (error, { body }) => {
        if (error) {
            callback('Unable to connect to weather service')
        } else if (body.error) {
            callback('unable to find location')
        } else {
            callback(null, body.currently)
        }
    })
}
module.exports = forecast