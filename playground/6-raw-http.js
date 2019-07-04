const https = require('https')
const url = `https://api.darksky.net/forecast/c2b49c819b918711ff77818f09b317d9/1,2?units=si`
const request = https.request(url, (response) => {
    let data = ''
    response.on('data', (chunk) =>{
        data +=  chunk.toString()
    })
    response.on('end', ()=>{

        console.log(JSON.parse(data))
    })
})

request.on('error', error =>{
    console.log('error: ', error)
})
request.end()