const fs = require('fs')
// const book = {
//     title: 'Build to last',
//     author: 'Jim Collin'
// }
// const bookJSON = JSON.stringify(book)
// fs.writeFileSync('1-JSON.json', bookJSON)
// const dataBuffer = fs.readFileSync('1-JSON.json')
// console.log(dataBuffer.toString())

const dataBuffer = fs.readFileSync('1-JSON.json')
const str = dataBuffer.toString()
const obj = JSON.parse(str)
obj.name = 'Nguyen Van Hung'
obj.age = 30
const newstr = JSON.stringify(obj)
fs.writeFileSync('1-JSON.json',newstr)