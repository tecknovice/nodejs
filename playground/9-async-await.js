const add = (a, b) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if(a<0||b<0) return reject('Number must be greater than 0')
            resolve(a + b)
        }, 2000)
    })
}
const doWork = async ()=>{
    // return 'a string'
    // throw new Error('this is error')

    const sum = await add(1,-2)
    const newSum = await add(sum,-3)
    return newSum
}
doWork().then(data=>console.log(data)).catch(e=>console.log(e))
