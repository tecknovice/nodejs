// const square = (x) =>{
//     return x*x
// }
// const square = x => x * x
// console.log(square(5))

const event = {
    name:'party',
    printGuestList:() => {
        console.log('guest list for', this.name)
    }
}
event.printGuestList()