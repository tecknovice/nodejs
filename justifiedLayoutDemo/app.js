const express = require('express')
const sizeOf = require('image-size');
const justifiedLayout = require('justified-layout')
const app = express()
const port = 3000
app.use(express.static('public'))

function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}


app.get('/', (req, res) => {
  // get images size
  let responseArr = []
  let image, dimensions
  for (let i = 1; i <= 20; i++) {
    image = 'public/image/' + i + '.png'
    dimensions = sizeOf(image)
    responseArr.push(
      {
        width: dimensions.width,
        height: dimensions.height,
        url: image
      }
    )
  }
  responseArr = shuffle(responseArr)
  console.log("responseArr", responseArr)
  // build layout
  let mobileOptions = { 
    containerWidth: 320, 
    targetRowHeight: 320,
    targetRowHeightTolerance: 1
  }
  let largeMobileOptions = { 
    containerWidth: 425, 
    targetRowHeight: 425,
    targetRowHeightTolerance: 1
  }
  let tabletOptions ={
    containerWidth: 768, 
    targetRowHeight: 550,
    targetRowHeightTolerance: 0.5
  }
  let desktopOptions = {
    containerWidth: 1000, 
    targetRowHeight: 550,
    targetRowHeightTolerance: 0.25
  }
  var geometry = justifiedLayout(responseArr, tabletOptions)
  console.log("geometry", geometry)

  var data = ''
  for (let j = 0; j < geometry.boxes.length; j++) {
    let box = geometry.boxes[j]
    data += `<div class="box" style="width: ${box.width}px; height: ${box.height}px; top: ${box.top}px; left: ${box.left}px"> <img src="${responseArr[j].url.slice(6)}"> </div> \n`
  }



  var section = ` 
  <!DOCTYPE html>
  <head>
      <title>justified layout demo</title>
  </head> <body> <div class="justified">${data}</div>`

  section += `    <style type="text/css" media="screen">
                *{
                    box-sizing: border-box;
                }
                .justified {
                    position: relative;
                    background: seagreen;
                    width: 768px;
                }

                .box {
                    position: absolute;
                    border: 1px solid;
                }
                img{
                    width: 100%;
                    height: 100%;
                    object-fit:cover;
                }
            </style> </body></html>`
  res.send(section)
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))