const request = require('request')

const geocode = (address, callback) => {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=pk.eyJ1IjoidGVja25vdmljZSIsImEiOiJjanhsa2oxeGgwNzRlM3ltdTZwejNiNndwIn0.OpsDF_TSQsn8TymRA0E8yA&limit=1`
    request({ url, json: true }, (error, { body }) => {
        if (error) {
            callback('unable to connect to location services')
        } else if (body.features.length === 0) {
            callback('unable to find location')
        } else {
            debugger
            const long = body.features[0].center[0]
            const lat = body.features[0].center[1]
            const place = body.features[0].place_name
            callback(null, { long, lat, place })
        }
    })
}

module.exports = geocode