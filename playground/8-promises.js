// const doWorkPromise = new Promise((resolve, reject) => {
//     setTimeout(() => {
//         reject('this is an error')
//         resolve([1, 2, 3])
//     }, 2000)
// })
// doWorkPromise.then((result) => {
//     console.log('Success', result)
// }).catch((error) => {
//     console.log('Error', error)
// })

const add = (a, b) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(a + b)
        }, 2000)
    })
}

// add(1, 2).then(sum => {
//     console.log(sum)
//     add(sum, 3).then(newSum => console.log(newSum)).catch(e => console.log(e))
// }).catch(e => console.log(e))

//Promise chaining
add(1, 2).then(sum => {
    console.log(sum)
    return add(sum, 3)
}).then(newSum => console.log(newSum))
    .catch(e => console.log(e))