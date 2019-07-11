// const add = (a, b, callback) => {
//     setTimeout(() => {
//         callback(a + b)
//     }, 2000)
// }

// add(1, 4, (sum) => {
//     console.log(sum) // Should print: 5
// })

const doWorkCallback = (callback) => {
    setTimeout(() => {
        callback('this is an error')
        // callback(null, [1, 2, 3])
    }, 2000)
}

doWorkCallback((error, result) => {
    if (error) return console.log(error)
    console.log(result)
})